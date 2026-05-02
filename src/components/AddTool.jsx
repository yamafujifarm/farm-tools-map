import { useState } from 'react'
import { addTool } from '../db'

export default function AddTool({ onBack, onSaved }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('名前を入力してください')
      return
    }
    setSaving(true)
    try {
      const tool = await addTool(trimmed)
      onSaved(tool.id)
    } catch (err) {
      setError('保存に失敗しました: ' + err.message)
      setSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
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
        <h2 className="text-xl font-bold">農機具を追加</h2>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            農機具名（ひらがなで入力）
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="例：くわ、すこっぷ、でんどうどらいばー"
            className="w-full px-4 py-4 text-lg border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700 space-y-1">
          <p className="font-medium">💡 ひらがな統一のすすめ</p>
          <p>「くわ」「でんどうのこぎり」のようにひらがなで統一すると検索しやすくなります。</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg font-semibold shadow-sm active:bg-green-700 disabled:opacity-40 transition-colors"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}
