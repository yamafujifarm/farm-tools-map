import { useState, useEffect } from 'react'
import { getTools, getAllRecords } from '../db'
import { formatDate } from '../imageUtils'

export default function ToolList({ onSelectTool, onAddTool, refreshKey }) {
  const [tools, setTools] = useState([])
  const [records, setRecords] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [refreshKey])

  async function load() {
    setLoading(true)
    const [toolList, recordList] = await Promise.all([getTools(), getAllRecords()])
    const recordMap = {}
    for (const r of recordList) recordMap[r.toolId] = r
    setTools(toolList)
    setRecords(recordMap)
    setLoading(false)
  }

  const filtered = tools.filter((t) => t.name.includes(search))

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 py-4 safe-top">
        <h1 className="text-xl font-bold">🌾 農機具トラッカー</h1>
        <p className="text-green-200 text-sm mt-0.5">{tools.length}件登録済み</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white border-b shadow-sm">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="農機具名を検索..."
            className="w-full pl-9 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
            <span className="text-4xl">{search ? '🔍' : '🌱'}</span>
            <p>{search ? `「${search}」は見つかりません` : 'まだ農機具が登録されていません'}</p>
          </div>
        ) : (
          filtered.map((tool) => {
            const rec = records[tool.id]
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="w-full bg-white rounded-2xl px-3 py-3 flex items-center gap-3 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {rec ? (
                    <img src={rec.photo} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🔧</div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="text-lg font-medium text-gray-800 truncate">{tool.name}</div>
                  <div className={`text-sm truncate ${rec ? 'text-green-600' : 'text-gray-400'}`}>
                    {rec ? `📍 ${formatDate(rec.updatedAt)}` : '未記録'}
                  </div>
                </div>
                <span className="text-gray-300 text-xl flex-shrink-0">›</span>
              </button>
            )
          })
        )}
      </div>

      {/* Add Button */}
      <div className="px-4 py-4 bg-white border-t safe-bottom">
        <button
          onClick={onAddTool}
          className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg font-semibold shadow-sm active:bg-green-700 transition-colors"
        >
          ＋ 農機具を追加する
        </button>
      </div>
    </div>
  )
}
