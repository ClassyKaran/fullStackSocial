import React, { useState } from 'react';
import { usePosts, useCreatePost, useLikePost, useUnlikePost, useCommentOnPost } from '../hooks/usePosts';

function Feed() {
  const navigateToProfile = userId => {
    window.location.href = `/profile/${userId}`;
  };
  const { data: posts, isLoading, isError, refetch } = usePosts();
  const createPost = useCreatePost();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const commentOnPost = useCommentOnPost();
  const [showAllLikes, setShowAllLikes] = useState({});
  const [showAllComments, setShowAllComments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [commentModal, setCommentModal] = useState({ open: false, postId: null });
  const [commentText, setCommentText] = useState("");
  const myId = localStorage.getItem('token') ? (() => {
    try {
      const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
      return payload.id || payload.userId || '';
    } catch { return ''; }
  })() : '';

  if (isLoading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (isError) return <div className="text-danger">Error loading posts.</div>;

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="d-flex justify-content-center mb-4">
        <div style={{ maxWidth: 500, width: '100%' }}>
          {/* <button className="btn btn-primary mb-3 w-100" onClick={refetch}>Refresh</button> */}
      {/* Floating Create Post Button */}
      <button
        className="btn btn-success rounded-circle shadow-lg position-fixed"
        style={{ bottom: 40, left: '50%', transform: 'translateX(-50%)', width: 64, height: 64, fontSize: 28, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setShowModal(true)}
        title="Create Post"
      >
        <i className="bi bi-plus-lg"></i>
      </button>
          {/* Create Post Modal */}
          {showModal && (
            <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Create Post</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (title.trim() || description.trim() || image || video) {
                        const formData = new FormData();
                        formData.append('title', title);
                        formData.append('description', description);
                        if (image) formData.append('image', image);
                        if (video) formData.append('video', video);
                        createPost.mutate(formData, {
                          onSuccess: () => {
                            setTitle("");
                            setDescription("");
                            setImage(null);
                            setVideo(null);
                            setShowModal(false);
                            refetch();
                          },
                        });
                      }
                    }}
                  >
                    <div className="modal-body">
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Title"
                      />
                      <textarea
                        className="form-control mb-2"
                        rows={3}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Description"
                      />
                      <label>upload any one</label><br/>
                      <label>Choose an image</label>
                      <input
                        type="file"
                        accept="image/*"
                     
                        className="form-control mb-2"
                        onChange={e => setImage(e.target.files[0])}
                      />
                      <label>Choose a video</label>
                      <input
                        type="file"
                        accept="video/*"
                  
                        className="form-control mb-2"
                        onChange={e => setVideo(e.target.files[0])}
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                      <button type="submit" className="btn btn-primary" disabled={createPost.isLoading}>Post</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {(posts?.data?.length === 0) && <div className="text-center text-muted">No posts yet.</div>}
          {(posts?.data || []).map(post => {
            const likedByMe = post.likes?.some(u => String(u._id || u.id) === String(myId));
            const postId = post._id || post.id;
            // Like/unlike toggle
            const handleLikeToggle = () => {
              if (likedByMe) {
                unlikePost.mutate(postId);
              } else {
                likePost.mutate(postId);
              }
            };
            // Show limited likes/comments
            const showLikes = showAllLikes[postId] ? post.likes : post.likes?.slice(0, 2);
            // Show comments newest first
            const sortedComments = [...(post.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const showComments = showAllComments[postId] ? sortedComments : sortedComments.slice(0, 2);
            console.log("showcomment" + showComments);
            
            return (
              <div className="card shadow mb-4 mx-auto" key={postId} style={{ borderRadius: 18, maxWidth: 500 }}>


 <div className="card-body pb-2">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          post.author?.profileImage
                            ? `${import.meta.env.VITE_API_BASE_URL}${post.author.profileImage}`
                            : 'https://ui-avatars.com/api/?name=' + (post.author?.username || 'User')
                        }
                        alt="User"
                        className="rounded-circle me-2"
                        style={{ width: 40, height: 40, objectFit: 'cover', background: '#eee', cursor: 'pointer' }}
                        onClick={() => navigateToProfile(post.author?._id || post.author?.id)}
                      />
                      <span className="fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigateToProfile(post.author?._id || post.author?.id)}>{post.author?.username || 'Unknown'}</span>
                    </div>
                    <span className="text-muted" style={{ fontSize: 13 }}>{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                  {post.title && <h6 className="fw-bold mb-1">{post.title}</h6>}
                  {post.description && <p className="mb-2">{post.description}</p>}

                
                  
                </div>

                {post.image && (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${post.image}`}
                    alt="Post"
                    className="w-100"
                    style={{ maxHeight: 350, objectFit: 'cover' }}
                  />
                )}
                {post.video && (
                  <video
                    src={`${import.meta.env.VITE_API_BASE_URL}${post.video}`}
                    controls
                    className="w-100"
                    style={{ maxHeight: 350, objectFit: 'cover' }}
                  />
                )}
                
                 <div className="d-flex gap-3 mb-2 justify-content-center">
                    <button className="btn btn-light border-0 px-2 py-1" style={{ fontSize: 22 }}
                      onClick={handleLikeToggle}
                      onDoubleClick={handleLikeToggle}
                      disabled={likePost.isLoading || unlikePost.isLoading}
                    >
                      <i className={`bi ${likedByMe ? 'bi-heart-fill' : 'bi-heart'}`} style={{ color: likedByMe ? '#ed4956' : '#888' }}></i>
                      <span className="ms-2" style={{ fontSize: 15 }}>{post.likes?.length || 0}</span>
                    </button>
                    <button className="btn btn-light border-0 px-2 py-1" style={{ fontSize: 22 }}
                      onClick={() => setCommentModal({ open: true, postId })}
                    >
                      <i className="bi bi-chat" style={{ color: '#262626' }}></i>
                      <span className="ms-2" style={{ fontSize: 15 }}>Comment</span>
                    </button>
                  </div>
                  
                  {/* Show liked users */}
                  {post.likes?.length > 0 && (
                    <div className="mb-2 p-2" style={{ fontSize: 13 }}>
                      <span className="fw-bold">Liked by: </span>
                      {showLikes.map((u, idx) => (
                        <span key={u._id || u.id} className="me-2">{u.username || 'User'}</span>
                      ))}
                      {post.likes.length > 2 && !showAllLikes[postId] && (
                        <button className="btn btn-link btn-sm p-0 ms-2" style={{ fontSize: 13 }} onClick={() => setShowAllLikes(s => ({ ...s, [postId]: true }))}>More</button>
                      )}
                      {showAllLikes[postId] && (
                        <button className="btn btn-link btn-sm p-0 ms-2" style={{ fontSize: 13 }} onClick={() => setShowAllLikes(s => ({ ...s, [postId]: false }))}>Less</button>
                      )}
                    </div>
                  )}

                  {/* Show comments */}
                  

              </div>
            );
          })}
      {/* Comment Modal */}
      {commentModal.open ? (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Comments</h5>
                <button type="button" className="btn-close" onClick={() => setCommentModal({ open: false, postId: null })}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {/* Show comments at top */}
                {(() => {
                  const post = (posts?.data || []).find(p => (p._id || p.id) === commentModal.postId);
                  if (!post || !post.comments?.length) return <div className="text-muted">No comments yet.</div>;
                  const sortedComments = [...(post.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                  return sortedComments.map((c, idx) => (
                    <div className="border-bottom py-2" key={idx}>
                    <div className=" d-flex align-items-center">
                     
                      <img
                        src={c.user?.profileImage ? `${import.meta.env.VITE_API_BASE_URL}${c.user.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.username || 'User')}`}
                        alt="Avatar"
                        className="rounded-circle me-2"
                        style={{ width: 28, height: 28, objectFit: 'cover', background: '#eee' }}
                      />
                      <span className="fw-bold ">{c.user?.username || 'User'}</span>
                      <span className="ms-auto text-muted" style={{ fontSize: 12 }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                    </div>
                      <p className="" style={{ fontSize: 15, paddingLeft:"38px" }}>{c.text}</p>
                    </div>
                  ));
                })()}
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (commentText.trim()) {
                    commentOnPost.mutate({ postId: commentModal.postId, text: commentText }, {
                      onSuccess: () => {
                        setCommentText('');
                        setCommentModal({ open: false, postId: null });
                        refetch();
                      }
                    });
                  }
                }}
              >
                <div className="modal-footer border-top">
                  <textarea
                    className="form-control"
                    rows={2}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Type your comment..."
                  />
                  <div className="d-flex justify-content-end mt-2">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setCommentModal({ open: false, postId: null })}>Close</button>
                    <button type="submit" className="btn btn-primary" disabled={commentOnPost.isLoading}>Send</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
        </div>
      </div>
    </div>
  );
}


export default Feed;
