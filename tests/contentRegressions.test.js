const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const babel = require('@babel/core')
const vue = require('vue')

// 使用项目现有 Babel 执行源码，以替身隔离云端请求和浏览器 API。
function loadModule(relativePath, dependencies, exportedBindings = '') {
  const filename = path.join(__dirname, '..', relativePath)
  let source = fs.readFileSync(filename, 'utf8')
  if (filename.endsWith('.vue')) {
    source = source.match(/<script setup>([\s\S]*?)<\/script>/)[1]
  }
  if (exportedBindings) source += `\nexport { ${exportedBindings} }`
  const { code } = babel.transformSync(source, {
    filename: filename + '.js',
    babelrc: false,
    configFile: false,
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')]
  })
  const exports = {}
  vm.runInNewContext(code, {
    exports,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`)
      return dependencies[name]
    },
    console
  }, { filename })
  return exports
}

function mediaUtils() {
  const uniqueMediaUrls = (values) => [...new Set(values.flat().filter(Boolean))]
  return {
    uniqueMediaUrls,
    getCaseMedia: (item) => uniqueMediaUrls([item?.list || item?.images || [], item?.image])
  }
}

function recordActions(serviceOverrides = {}, overrides = {}) {
  const media = mediaUtils()
  const { useContentRecordActions } = loadModule('src/composables/useContentRecordActions.js', {
    '@/mock/data': {},
    '@/utils/contentRecords': media,
    '@/services/cloudCases': {
      upsertCloudCase: async (payload) => payload,
      upsertCloudAward: async (payload) => payload,
      ...serviceOverrides
    }
  })
  const state = {
    cloudEnabled: true,
    form: { name: '作品', images: ['new.jpg'], coverImage: 'cover.jpg', cadFilePath: 'new.dwg', videoUrl: 'new.mp4' },
    awardForm: { title: '奖项', image: 'award.jpg' },
    editingCase: { value: null },
    editingAward: { value: null },
    statusText: { value: '' },
    awardStatusText: { value: '' },
    saving: { value: false },
    awardSaving: { value: false },
    uploading: { value: false },
    awardUploading: { value: false },
    cadUploading: { value: false },
    videoUploading: { value: false },
    originalCaseMedia: new Set(['old.jpg']),
    uploadedCaseMedia: new Set(['new.jpg', 'cover.jpg']),
    originalCaseCadPath: { value: 'old.dwg' },
    uploadedCaseCadPaths: new Set(['new.dwg']),
    originalCaseVideoUrl: { value: 'old.mp4' },
    uploadedCaseVideoUrls: new Set(['new.mp4']),
    originalAwardMedia: new Set(),
    uploadedAwardMedia: new Set(['award.jpg']),
    currentCaseId: () => 'case-1',
    currentAwardId: () => 'award-1',
    getCurrentCaseMedia: () => ['new.jpg', 'cover.jpg'],
    getUnusedCaseCadPaths: (paths) => paths.filter((value) => value !== 'new.dwg'),
    getUnusedCaseVideoUrls: (urls) => urls.filter((value) => value !== 'new.mp4'),
    cleanUnusedCloudMedia: async () => 0,
    resetForm() {},
    resetAwardForm() {},
    refreshList() {},
    refreshAwardsList() {},
    refreshCloudList: async () => {},
    ...overrides
  }
  return { state, actions: useContentRecordActions(state) }
}

test('successful case save protects committed files when list refresh fails', async () => {
  const { actions, state } = recordActions({}, {
    refreshCloudList: async () => { throw new Error('offline') }
  })
  await actions.handleSubmit()
  assert.equal(state.uploadedCaseMedia.size, 0)
  assert.equal(state.uploadedCaseCadPaths.size, 0)
  assert.equal(state.uploadedCaseVideoUrls.size, 0)
  assert.match(state.statusText.value, /^已保存.*列表刷新失败/)
  assert.equal(state.saving.value, false)
})

test('successful award save protects committed image when list refresh fails', async () => {
  const { actions, state } = recordActions({}, {
    refreshCloudList: async () => { throw new Error('offline') }
  })
  await actions.handleAwardSubmit()
  assert.equal(state.uploadedAwardMedia.size, 0)
  assert.match(state.awardStatusText.value, /^已保存.*列表刷新失败/)
  assert.equal(state.awardSaving.value, false)
})

test('failed write keeps draft files available for later cleanup', async () => {
  const { actions, state } = recordActions({
    upsertCloudCase: async () => { throw new Error('write failed') }
  })
  await actions.handleSubmit()
  assert.equal(state.uploadedCaseMedia.size, 2)
  assert.equal(state.uploadedCaseCadPaths.size, 1)
  assert.match(state.statusText.value, /^保存失败/)
})

test('replacement cleans old CAD and video using string paths', async () => {
  let cadPaths, videoUrls
  const { actions } = recordActions({
    deleteCaseCadFiles: async (paths) => { cadPaths = [...paths] },
    deleteCaseVideos: async (urls) => { videoUrls = [...urls] }
  })
  await actions.handleSubmit()
  assert.deepEqual(cadPaths, ['old.dwg'])
  assert.deepEqual(videoUrls, ['old.mp4'])
})

function imageManager({ failSecondUpload = false } = {}) {
  let uploads = 0
  const { useContentImageManager } = loadModule('src/composables/useContentImageManager.js', {
    '@/utils/contentImages': {
      isSupportedImage: () => true,
      optimizeGalleryImage: async (file) => ({ file, optimized: true }),
      createCoverImageFile: async () => { throw new Error('cover failed') }
    },
    '@/services/cloudCases': {
      uploadCaseImage: async () => {
        uploads += 1
        if (failSecondUpload && uploads === 2) throw new Error('upload failed')
        return `photo-${uploads}.jpg`
      }
    }
  })
  const state = {
    cloudEnabled: true,
    form: { images: [], coverImage: '' },
    statusText: { value: '' },
    uploading: { value: false },
    uploadedCaseMedia: new Set(),
    currentCaseId: () => 'case-1'
  }
  return { state, actions: useContentImageManager(state) }
}

test('cover failure retains uploaded images once', async () => {
  const { actions, state } = imageManager()
  await actions.handleImageUpload({ target: { files: [{}], value: 'file' } })
  assert.deepEqual([...state.form.images], ['photo-1.jpg'])
  assert.equal(state.form.coverImage, 'photo-1.jpg')
  assert.equal(state.uploading.value, false)
})

test('partial batch failure retains successful images once', async () => {
  const { actions, state } = imageManager({ failSecondUpload: true })
  await actions.handleImageUpload({ target: { files: [{}, {}], value: 'files' } })
  assert.deepEqual([...state.form.images], ['photo-1.jpg'])
  assert.match(state.statusText.value, /已保留 1 张/)
})

test('external links reject executable and relative URLs and isolate new windows', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/caseLinks.mjs'), 'utf8')
  const { code } = babel.transformSync(source, {
    babelrc: false, configFile: false,
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')]
  })
  const opened = []
  const exports = {}
  vm.runInNewContext(code, { exports, URL, window: { open: (...args) => opened.push(args) } })
  for (const link of ['javascript:alert(1)', 'data:text/html,test', '/relative', 'invalid']) {
    assert.equal(exports.normalizeExternalLink(link), '')
    exports.openExternalLink(link)
  }
  assert.equal(opened.length, 0)
  exports.openExternalLink(' https://example.com/3d ')
  assert.deepEqual(Array.from(opened[0]), ['https://example.com/3d', '_blank', 'noopener,noreferrer'])
})

test('quote token changes reload data and ignore stale responses', async () => {
  const route = vue.reactive({ params: { token: 'first' } })
  const pending = new Map()
  const scope = vue.effectScope()
  const state = scope.run(() => loadModule('src/views/quoteView.vue', {
    vue,
    'vue-router': { useRoute: () => route },
    '@/services/quotes': {
      fetchQuoteByToken: (token) => new Promise((resolve) => pending.set(token, resolve))
    }
  }, 'quote, loading'))
  const settle = () => new Promise((resolve) => setImmediate(resolve))
  try {
    route.params.token = 'second'
    await vue.nextTick()
    pending.get('second')({ quoteNo: 'second' })
    await settle()
    assert.equal(state.quote.value.quoteNo, 'second')
    pending.get('first')({ quoteNo: 'first' })
    await settle()
    assert.equal(state.quote.value.quoteNo, 'second')
    assert.equal(state.loading.value, false)
    route.params.token = 'third'
    await vue.nextTick()
    assert.equal(state.quote.value, null)
    assert.equal(state.loading.value, true)
  } finally {
    scope.stop()
  }
})

test('video upload accepts only MP4 and rejects an undecodable picture track', async () => {
  const {
    detectMp4VideoCodec,
    validateMp4VideoCodec,
    validatePlayableVideo,
    validateVideoContainer
  } = loadModule('src/utils/contentVideos.js', {})
  assert.throws(
    () => validateVideoContainer({ name: 'iphone.mov', type: 'video/quicktime' }),
    /H\.264/
  )

  const mp4File = (signature) => {
    const box = (type, ...parts) => {
      const payload = Buffer.concat(parts)
      const header = Buffer.alloc(8)
      header.writeUInt32BE(8 + payload.length)
      header.write(type, 4)
      return Buffer.concat([header, payload])
    }
    const handler = Buffer.alloc(12)
    handler.write('vide', 8)
    const bytes = Buffer.concat([
      box('mdat', Buffer.from('avc1 hvc1 are incidental payload strings')),
      box('moov', box('trak', box('mdia',
        box('hdlr', handler),
        box('minf', box('stbl', box('stsd', Buffer.from([0, 0, 0, 0, 0, 0, 0, 1]), box(signature))))
      )))
    ])
    const asArrayBuffer = (buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    return {
      name: 'video.mp4',
      type: 'video/mp4',
      size: bytes.length,
      slice: (start, end) => ({ arrayBuffer: async () => asArrayBuffer(bytes.subarray(start, end)) }),
      arrayBuffer: async () => asArrayBuffer(bytes)
    }
  }
  assert.equal(await detectMp4VideoCodec(mp4File('avc1')), 'avc1')
  await assert.rejects(validateMp4VideoCodec(mp4File('hvc1')), /HEVC\/H\.265/)

  const video = {
    canPlayType: () => 'probably',
    videoWidth: 0,
    videoHeight: 0,
    duration: 12,
    removeAttribute() {},
    load() {}
  }
  const validation = validatePlayableVideo(
    mp4File('avc1'),
    {
      createElement: () => video,
      createObjectURL: () => 'blob:test',
      revokeObjectURL() {},
      setTimeout: () => 1,
      clearTimeout() {}
    }
  )
  await new Promise((resolve) => setImmediate(resolve))
  video.onloadeddata()
  await assert.rejects(validation, /无法解码视频画面/)

  const released = []
  video.videoWidth = 1920
  video.videoHeight = 1080
  video.load = () => { video.videoWidth = 0; video.videoHeight = 0 }
  const playable = validatePlayableVideo(mp4File('avc1'), {
    createElement: () => video,
    createObjectURL: () => 'blob:valid',
    revokeObjectURL: (url) => released.push(url),
    setTimeout: () => 1,
    clearTimeout() {}
  })
  await new Promise((resolve) => setImmediate(resolve))
  video.onloadeddata()
  const metadata = await playable
  assert.equal(metadata.width, 1920)
  assert.equal(metadata.height, 1080)
  assert.deepEqual(released, ['blob:valid'])
  assert.equal(video.onloadeddata, null)
})
