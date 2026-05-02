import { useState, useEffect, useRef } from 'react'
import { getTool, getRecord, saveRecord, deleteTool } from '../db'
import { compressImage, formatDate } from '../imageUtils'

export default function ToolDetail({ toolId, onBack, onDeleted }) {
  const [tool, setTool] = useState(null)
  const [record, setRecord] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    load()
  }, [toolId])

  async function load() {
    const [t, r] = await Promise.all([getTool(toolId), getRecord(toolId)])
    setTool(t)
    setRecord(r || null)
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const dataUrl = await compressImage(file)
      const saved = await saveRecord(toolId, dataUrl)
      setRecord(saved)
    } catch (err) {
      alert('写真の保存に失敗しました: ' + err.message)
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  async function handleDelete() {
    await deleteTool(toolId)
    onDeleted()
  }

  if (!tool) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 py-4 flex items-center gap-3 safe-top">
        <button
          onClick={onBack}
          className="text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-xl active:bg-green-600"
        >
          ‹
        </button>
        <h2 className="text-xl font-bold flex-1 truncate">{tool.name}</h2>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-green-200 text-sm px-3 py-1.5 rounded-xl active:bg-green-600"
        >
          削除
        </button>
      </div>

      {/* Photo area */}
      <div className="flex-1 overflow-y-auto">
        {record ? (
          <div>
            <img
              src={record.photo}
              className="w-full object-contain bg-black max-h-[60vh]"
              alt={`${tool.name}の場所`}
            />
            <div className="p-4 bg-white border-b">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <span>📍</span>
                <span>最終記録：{formatDate(record.updatedAt)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(record.updatedAt).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-3">
            <span className="text-6xl">📷</span>
            <p className="text-base">まだ場所が記録されていません</p>
            <p className="text-sm text-gray-300">下のボタンで今の場所を撮影してください</p>
          </div>
        )}
      </div>

      {/* Camera button */}
      <div className="px-4 py-4 bg-white border-t safe-bottom">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg font-semibold shadow-sm active:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : record ? '📷 写真を撮り直す' : '📷 今の場所を記録する'}
        </button>
      </div>

      {/* Delete confirm dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">「{tool.name}」を削除しますか？</h3>
            <p className="text-gray-500 text-sm">記録した写真も一緒に削除されます。この操作は取り消せません。</p>
            <button
              onClick={handleDelete}
              className="w-full bg-red-500 text-white py-4 rounded-2xl text-lg font-semibold"
            >
              削除する
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl text-lg font-semibold"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
