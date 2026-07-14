"use client";

import { useState } from "react";

function Sidebar({
  documents = [],
  activeDoc,
  onNewDocument,
  onOpenDocument,
  onRenameDocument,
  onDeleteDocument,
  isOpen,
  onToggle
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const startEditing = (e, id, currentTitle) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const finishEditing = () => {
    if (editingId && editingTitle.trim() && editingTitle.trim() !== documents.find(d => d.id === editingId)?.title) {
      onRenameDocument(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      finishEditing();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const showDeleteConfirm = (e, doc) => {
    e.stopPropagation();
    setDocumentToDelete(doc);
  };

  const hideDeleteConfirm = () => {
    setDocumentToDelete(null);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      onDeleteDocument(documentToDelete.id);
      hideDeleteConfirm();
    }
  };

  return (
    <div style={{
      height: '100%',
      backgroundColor: '#f8fafc',
      color: '#333333',
      display: 'flex',
      flexDirection: 'column',
      width: isOpen ? '260px' : '70px',
      borderRight: '1px solid #e2e8f0',
      flexShrink: 0,
      zIndex: 10,
      overflow: 'hidden',
      transition: 'width 0.3s ease',
      position: 'relative',
      alignItems: isOpen ? 'stretch' : 'center'
    }}>

      {/* Header: Chat History Title + Close/Open Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        padding: isOpen ? '18px 16px 4px 16px' : '20px 0 10px 0',
        width: '100%'
      }}>
        {isOpen && (
          <span style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#1e293b',
            letterSpacing: '0.01em',
          }}>
            Chat History
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            padding: '8px',
            background: isOpen ? 'none' : '#ffffff',
            border: isOpen ? 'none' : '1px solid #e2e8f0',
            cursor: 'pointer',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'all 0.2s',
            boxShadow: isOpen ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = isOpen ? 'transparent' : '#ffffff'}
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? (
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
 
      {/* New Chat Button */}
      <div style={{ 
        padding: isOpen ? '10px 16px 16px 16px' : '10px 0',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={onNewDocument}
          style={{
            width: isOpen ? '100%' : '42px',
            height: isOpen ? 'auto' : '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isOpen ? '12px' : '0',
            padding: isOpen ? '10px 16px' : '0',
            backgroundColor: '#0f172a',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
          title="New Chat"
        >
          <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {isOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        paddingLeft: isOpen ? '12px' : '8px', 
        paddingRight: isOpen ? '12px' : '8px', 
        paddingBottom: '16px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <style dangerouslySetInnerHTML={{ __html: `div::-webkit-scrollbar { display: none; }` }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          {documents.length === 0 ? (
            isOpen && (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>No history</p>
              </div>
            )
          ) : (
            documents.map((doc) => (
              <div key={doc.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingId === doc.id && isOpen ? (
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '4px 8px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #0f172a'
                    }}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={finishEditing}
                        style={{
                          flex: 1,
                          backgroundColor: 'transparent',
                          color: '#222',
                          fontSize: '13px',
                          border: 'none',
                          outline: 'none',
                          padding: '4px 0'
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenDocument(doc.id)}
                      style={{
                        flex: 1,
                        width: isOpen ? '100%' : '42px',
                        height: isOpen ? 'auto' : '42px',
                        textAlign: 'left',
                        padding: isOpen ? '12px' : '0',
                        borderRadius: '8px',
                        backgroundColor: activeDoc === doc.id ? '#f1f5f9' : '#ffffff',
                        color: activeDoc === doc.id ? '#0f172a' : '#475569',
                        border: activeDoc === doc.id ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        gap: isOpen ? '12px' : '0'
                      }}
                      onMouseOver={(e) => {
                        if (activeDoc !== doc.id) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (activeDoc !== doc.id) {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }
                      }}
                      title={!isOpen ? doc.title : ""}
                    >
                      <svg style={{ width: '18px', height: '18px', flexShrink: 0, opacity: activeDoc === doc.id ? 1 : 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {isOpen && <span style={{ fontSize: '13px', fontWeight: activeDoc === doc.id ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</span>}
                    </button>
                  )}
                  
                  {/* Action Buttons - Only show when open */}
                  {isOpen && (
                    <div className="sidebar-actions" style={{ 
                      display: 'flex', 
                      gap: '2px', 
                      position: 'absolute', 
                      right: '8px',
                      opacity: editingId === doc.id ? 1 : 0
                    }}>
                      {editingId === doc.id ? (
                        <>
                          <button onClick={finishEditing} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <svg style={{ width: '14px', height: '14px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button onClick={cancelEditing} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <svg style={{ width: '14px', height: '14px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={(e) => startEditing(e, doc.id, doc.title)}
                            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#6c718a' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#6c718a'}
                          >
                            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => showDeleteConfirm(e, doc)}
                            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#6c718a' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#6c718a'}
                          >
                            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-actions {
          visibility: hidden;
          background: transparent;
          padding-left: 20px;
        }
        div:hover > div > div > .sidebar-actions {
          visibility: visible;
          opacity: 1 !important;
        }
      `}} />

      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "28px",
            maxWidth: "380px",
            width: "100%",
            textAlign: "center"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Delete Chat?</h3>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
              This will permanently delete "<strong>{documentToDelete.title}</strong>".
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={hideDeleteConfirm}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#f3f4f6",
                  color: "#4b5563",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
