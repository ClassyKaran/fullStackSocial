
import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserPosts } from '../hooks/useUserPosts';
import { useLikePost, useCommentOnPost } from '../hooks/usePosts';



function Profile() {
  // Delete post handler
  const handleDeletePost = async postId => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Delete this post?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      refetch();
    } catch {
      alert('Delete failed');
    }
  };

  // Message button handler
  const handleMessage = () => {
    window.location.href = `/chat?userId=${userId}`;
  };
  const [showListModal, setShowListModal] = useState({ open: false, type: null });

  const [commentModal, setCommentModal] = useState({ open: false, postId: null });
  const [commentText, setCommentText] = useState('');


  const likePost = useLikePost();
  const commentOnPost = useCommentOnPost();


  const myId = localStorage.getItem('token') ? (() => {
    try {
      const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
      return payload.id || payload.userId || '';
    } catch { return ''; }
  })() : '';
  
  const { userId } = useParams();
  const { data: profile, isLoading, isError, follow, unfollow, refetch } = useAuth(userId);
  const { data: userPosts, isLoading: postsLoading } = useUserPosts(userId);
  const fileInputRef = useRef();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      refetch(); // Refetch profile data after upload
    } catch (err) {
      alert('Image upload failed');
    }
  };

  if (isLoading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (isError) return <div className="text-danger">Error loading profile.</div>;

  return (
    <>
      <>
  {/* Profile Section */}
  <div className="container py-4 border-bottom">
    <div className="row align-items-center">
      {/* Profile Image */}
      <div className="col-md-4 text-center mb-3 mb-md-0">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={
              profile?.profileImage
                ? `${import.meta.env.VITE_API_BASE_URL}${profile.profileImage}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}`
            }
            alt="Profile"
            className="rounded-circle border"
            style={{
              width: 150,
              height: 150,
              objectFit: 'cover',
              background: '#eee',
              border: '3px solid white',
              boxShadow: '0 0 8px rgba(0,0,0,0.1)'
            }}
            onError={e => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}`;
            }}
          />
          {String(profile?._id || profile?.id) === String(myId) && (
            <>
              <button
                className="btn btn-sm btn-outline-secondary position-absolute"
                style={{ bottom: 0, right: 0 }}
                onClick={() => fileInputRef.current.click()}
              >
                <i className="bi bi-pencil"></i>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="col-md-8">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
          <h3 className="fw-bold mb-0">{profile?.username}</h3>
          <div>
            {String(profile?._id || profile?.id) === String(myId) ? (
              <p></p>
            ) : profile?.isFollowing ? (
              <button className="btn btn-outline-danger btn-sm" onClick={() => unfollow(userId)}>Unfollow</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => follow(userId)}>Follow</button>
            )}
            {/* Message Button */}
            {String(profile?._id || profile?.id) !== String(myId) && (
              <button className="btn btn-outline-primary btn-sm ms-2" onClick={handleMessage}>
                <i className="bi bi-chat-dots me-1"></i> Message
              </button>
            )}
          </div>
        </div>
        <p className="text-muted mb-2">{profile?.email}</p>
        <div className="d-flex gap-4 mt-2">
          <div><strong>{userPosts?.data?.length || 0}</strong> Posts</div>
          <div style={{ cursor: 'pointer' }} onClick={() => setShowListModal({ open: true, type: 'followers' })}>
            <strong>{profile?.followers?.length || 0}</strong> Followers
          </div>
          <div style={{ cursor: 'pointer' }} onClick={() => setShowListModal({ open: true, type: 'following' })}>
            <strong>{profile?.following?.length || 0}</strong> Following
          </div>
        </div>
  {/* Followers/Following Modal */}
  {showListModal.open && (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {showListModal.type === 'followers' ? 'Followers' : 'Following'}
            </h5>
            <button type="button" className="btn-close" onClick={() => setShowListModal({ open: false, type: null })}></button>
          </div>
          <div className="modal-body">
            <ul className="list-group list-group-flush">
              {(showListModal.type === 'followers' ? profile?.followers : profile?.following)?.map(u => (
                <li key={u._id || u.id} className="list-group-item d-flex align-items-center">
                  <img
                    src={u.profileImage ? `${import.meta.env.VITE_API_BASE_URL}${u.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || 'User')}`}
                    alt="Avatar"
                    className="rounded-circle me-2"
                    style={{ width: 32, height: 32, objectFit: 'cover', background: '#eee' }}
                  />
                  <span className="fw-semibold">{u.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )}
      </div>
    </div>
  </div>

  {/* User Posts - Grid View */}
  <div className="container py-4">
    <h5 className="mb-4">Posts</h5>
    {postsLoading ? (
      <div className="d-flex justify-content-center"><div className="spinner-border" role="status"></div></div>
    ) : (userPosts?.data?.length === 0 ? (
      <div className="text-muted">No posts yet.</div>
    ) : (
      <div className="row row-cols-2 row-cols-md-3 g-3">
        {userPosts?.data?.map(post => (
          <div className="col" key={post._id || post.id}>
            <div className="card h-100 border-0">
              {post.image && (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${post.image}`}
                  alt="Post"
                  className="w-100"
                  style={{ aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 8 }}
                />
              )}
              <div className="p-2">
                {post.title && <h6 className="fw-bold mb-1">{post.title}</h6>}
                <div className="d-flex justify-content-between small text-muted">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.likes?.length || 0} likes</span>
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-light btn-sm border"
                    onClick={() => likePost.mutate(post._id || post.id)}
                    disabled={likePost.isLoading}
                  >
                    <i className="bi bi-heart-fill text-danger me-1"></i> Like
                  </button>
                  <button className="btn btn-light btn-sm border"
                    onClick={() => setCommentModal({ open: true, postId: post._id || post.id })}
                  >
                    <i className="bi bi-chat-left-text me-1"></i> Comment
                  </button>
                  {String(post.author?._id || post.author?.id) === String(myId) && (
                    <div>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeletePost(post._id || post.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ))}

    {/* Comment Modal */}
    {commentModal.open && (
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
                const post = (userPosts?.data || []).find(p => (p._id || p.id) === commentModal.postId);
                if (!post || !post.comments?.length) return <div className="text-muted">No comments yet.</div>;
                const sortedComments = [...(post.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                return sortedComments.map((c, idx) => (
                  <div key={idx} className="border-bottom py-2 d-flex align-items-center" style={{ fontSize: 15 }}>
                    <img
                      src={c.user?.profileImage ? `${import.meta.env.VITE_API_BASE_URL}${c.user.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.username || 'User')}`}
                      alt="Avatar"
                      className="rounded-circle me-2"
                      style={{ width: 28, height: 28, objectFit: 'cover', background: '#eee' }}
                    />
                    <span className="fw-bold me-2">{c.user?.username || 'User'}</span>
                    <span className="me-2 text-muted" style={{ fontSize: 13 }}>{c.text}</span>
                    <span className="ms-auto text-muted" style={{ fontSize: 12 }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
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
    )}
  </div>
</>

    </>
  );
}

export default Profile;
