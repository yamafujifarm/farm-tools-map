import { useState } from 'react'
import ToolList from './components/ToolList'
import ToolDetail from './components/ToolDetail'
import AddTool from './components/AddTool'

export default function App() {
  const [view, setView] = useState('list')
  const [selectedToolId, setSelectedToolId] = useState(null)
  const [listRefreshKey, setListRefreshKey] = useState(0)

  function refreshList() {
    setListRefreshKey((k) => k + 1)
  }

  function openDetail(toolId) {
    setSelectedToolId(toolId)
    setView('detail')
  }

  function openAdd() {
    setView('add')
  }

  function backToList() {
    refreshList()
    setView('list')
  }

  function onToolAdded(toolId) {
    refreshList()
    setSelectedToolId(toolId)
    setView('detail')
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      {view === 'list' && (
        <ToolList
          onSelectTool={openDetail}
          onAddTool={openAdd}
          refreshKey={listRefreshKey}
        />
      )}
      {view === 'detail' && (
        <ToolDetail
          toolId={selectedToolId}
          onBack={backToList}
          onDeleted={backToList}
        />
      )}
      {view === 'add' && (
        <AddTool
          onBack={() => setView('list')}
          onSaved={onToolAdded}
        />
      )}
    </div>
  )
}
