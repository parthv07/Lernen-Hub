import React from 'react'
import { useState, useEffect, useContext } from 'react'
import { ipaddress } from '../App'
import { Context } from '../context/Context_provider'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from './axiosInstance'
import { getAccessToken } from './authService'
import * as bootstrap from 'bootstrap';
import { useSelector } from 'react-redux'

const Group_discussion_modals = ({ usercomments_status, group_id, setCount }) => {
  const user = useSelector((state) => state.auth.user)

  const { translate_value } = useContext(Context)

  const [userComments, setuserComments] = useState([])
  const [pinnedComments_layout_status, setpinnedComments_layout_status] = useState(false)
  const [index1, setindex1] = useState(-1)
  const [replies_layout, setreplies_layout] = useState(false)


  const [replies, setReplies] = useState("")
  const [selectedPostForComment, setSelectedPostForComment] = useState(null)
  const repliesData = (e) => {
    setReplies(e.target.value)
  }

  const [userdetails, setUserdetails] = useState({})

  useEffect(() => {
    setUserdetails(user)

    getusercomments()

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    return () => {
      tooltipList.forEach((tooltip) => {
        tooltip.dispose();
      });
    };
  }, [usercomments_status])

  // -------------------------------------Function to fetch the particular Group details------------------------------------
  const [groupdetails, setGroupdetails] = useState({})

  const fetchgroupdetails = () => {
    axiosInstance.get(`${ipaddress}/DisplayGroupDetails/${group_id}/${user.user_id}/`)
      .then((r) => {
        // console.log("Particular Group Details",r.data)
        setGroupdetails(r.data)
      })
      .catch((err) => {
        // console.log("Particular group error",err)
      })
  }

  // --------------------------------------GET PINNED COMMENTS-------------------------------------------------------
  const getusercomments = () => {
    axiosInstance.get(`${ipaddress}/UserCommentedGroupsMessages/${user.user_id}/${group_id}/`)
      .then((r) => {
        // console.log("User discussion for groups",r.data)
        setuserComments(r.data.reverse())
      })
      .catch(() => {
        // console.log("User Comments in organization fetching error")
      })
  }

  // -----------------------------------------------REPLIES IMAGE UPLOAD--------------------------------------------------
  const [repliesImage3, setRepliesImage3] = useState([]);
  const [load, setload] = useState()

  const clearInput = (index) => {
    const inputElement = document.getElementsByClassName('user_reply-input');
    if (inputElement) {
      inputElement[index].value = '';
    }
  };

  const handleReplyImage3 = (event) => {
    const files = event.target.files
    // Ensure that 'files' is not null or undefined
    if (files && files.length > 0) {
      setRepliesImage3(Array.from(files));
    } else {
      setRepliesImage3([]);
    }
  };

  const removeImage3 = (index) => {
    setRepliesImage3((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const postReplies = async (e, dis_id, index) => {
    e.preventDefault();
    setload(true);
    const formData = new FormData();
    for (const file of repliesImage3) {
      if (file.size <= 1024 * 1024) {
        formData.append('images_attached', file);
      } else {
        // console.error('File size exceeds 1 MB:', file.name);
        alert("Image size limit exceeds")
      }
    }
    const encoded_reply = encodeURIComponent(replies)

    if (replies.length > 0) {
      try {
        const token = getAccessToken()

        const response = await fetch(`${ipaddress}/NewGroupDiscussionReplyView/${user.user_id}/${dis_id}/${group_id}/""/?post=${encoded_reply}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          // console.log('Group Reply Reply Sent successfully',formData);
          clearInput(index)
          getusercomments()
          setCount((prev) => prev + 1)
          setreplies_layout(false)
          setReplies("")

          setRepliesImage3([])
          setload(false)
          setSelectedPostForComment(null);
        } else {
          setload(false)
          setSelectedPostForComment(null);
          // console.error('Group Reply Reply sending error');
        }
      } catch (error) {
        setload(false)
        setSelectedPostForComment(null);
        // console.error('Error reply uploading files:', error);
      }
    }
  }


  // --------------------Functionality to post replies under a reply---------------------------------------------------------
  const [reply_id, setreply_id] = useState(0)
  const [discuss_id, setdiscuss_id] = useState(0)
  const [reply_index, setreply_index] = useState(0)

  const [replies_reply_Image3, setReplies_reply_image3] = useState([]);
  const [reply_for_reply, setReply_for_reply] = useState("")
  const clearInput2 = (index) => {
    const inputElement = document.getElementsByClassName('reply-input2');
    if (inputElement) {
      inputElement[index].value = '';
    }
  };

  const handleReply_reply_Image3 = (event) => {
    const files = event.target.files
    // Ensure that 'files' is not null or undefined
    if (files && files.length > 0) {
      setReplies_reply_image3(Array.from(files));
    } else {
      setReplies_reply_image3([]);
    }
  };

  const removereply_Image3 = (index) => {
    setReplies_reply_image3((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  const postreply_for_replies = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const file of replies_reply_Image3) {
      formData.append('images_attached', file);
    }
    const encoded_reply_reply = encodeURIComponent(reply_for_reply)

    if (reply_for_reply.length > 0) {
      try {
        const token = getAccessToken()

        const response = await fetch(`${ipaddress}/GroupDiscussionRepliesReplyView/${user.user_id}/${reply_id}/""/?post=${encoded_reply_reply}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          // console.log('Group Reply for reply Sent successfully',response.data);
          setReply_for_reply("")
          getreplies(discuss_id)
          setreplies_for_reply_status(false)
          setReplies_reply_image3([])
        } else {
          // console.error('Group Reply under reply sending error');
        }
      } catch (error) {
        // console.error('Error reply uploading files:', error);
      }
    }
  }

  // ------------------------------------------------LIKES-------------------------------------------------------
  function handleLike1(discussion_id) {
    axiosInstance.delete(`${ipaddress}/NewGroupDiscussionLikeView/${user.user_id}/${group_id}/${discussion_id}/`)
      .then((r) => {
        //  console.log("User Unliked the Post",r.data)
        getusercomments()
        setCount((prev) => prev + 1)
      })
      .catch(() => {
        //  console.log("User Unlike error")
      })
  }
  function handleLike(discussion_id) {
    axiosInstance.post(`${ipaddress}/NewGroupDiscussionLikeView/${user.user_id}/${group_id}/${discussion_id}/`)
      .then((r) => {
        // console.log("User liked the Post",r.data)
        getusercomments()
        setCount((prev) => prev + 1)
      })
      .catch((err) => {
        // console.log("User like error",err)
      })
  }

  // ------------------------------------------------DISLIKES-------------------------------------------------------
  function handledislike1(discussion_id) {
    axiosInstance.delete(`${ipaddress}/NewGroupDiscussionDisLikeView/${user.user_id}/${group_id}/${discussion_id}/`)
      .then((r) => {
        // console.log("User Unliked the Post",r.data)
        getusercomments()
        setCount((prev) => prev + 1)
      })
      .catch(() => {
        // console.log("User Unlike error")
      })
  }
  function handledislike(discussion_id) {
    axiosInstance.post(`${ipaddress}/NewGroupDiscussionDisLikeView/${user.user_id}/${group_id}/${discussion_id}/`)
      .then((r) => {
        //  console.log("User Disliked the Post",r.data)
        getusercomments()
        setCount((prev) => prev + 1)
      })
      .catch(() => {
        console.log("User like error")
      })
  }


  //  ------------------------------------------------Reply Likes---------------------------------------------------------
  function handleReplyLike1(disc_reply_id, discid, index) {
    axiosInstance.delete(`${ipaddress}/NewGroupDiscussionReplyLikeView/${user.user_id}/${discid}/${disc_reply_id}/`)
      .then((r) => {
        // console.log("Group Unliked the Reply",r.data)
        getreplies(discid, index)
      })
      .catch((err) => {
        console.log("Group Reply Unlike error", err)
      })
  }
  function handleReplyLike(disc_reply_id, discid, index) {
    axiosInstance.post(`${ipaddress}/NewGroupDiscussionReplyLikeView/${user.user_id}/${discid}/${disc_reply_id}/`)
      .then((r) => {
        //  console.log("Group liked the Reply",r.data)
        getreplies(discid, index)
      })
      .catch((err) => {
        console.log("Group Reply like error", err)
      })
  }

  // -----------------------------------To dislike the reply under particular post-------------------------------------------
  function handleReplyDisLike(disc_reply_id, discid, index) {
    axiosInstance.post(`${ipaddress}/NewGroupDiscussionReplyDisLikeView/${user.user_id}/${discid}/${disc_reply_id}/`)
      .then((r) => {
        // console.log("Group disliked the Reply",r.data)
        getreplies(discid, index)
      })
      .catch(() => {
        console.log("Group Reply dislike error")
      })
  }


  //  ----------------------Functionality to like the reply under particular reply in the discussion---------------------------------------------------------

  function handleReplies_reply_like(replies_reply_id, disc_replyid) {
    axiosInstance.post(`${ipaddress}/GroupDiscussionRepliesReplyLike/${user.user_id}/${replies_reply_id}/`)
      .then((r) => {
        // console.log("User liked the Replies reply",r.data)
        getreplies_for_reply(disc_replyid)
      })
      .catch((err) => {
        console.log("User Replies reply like error", err)
      })
  }

  //  -----------------------------Functionality to dislike the reply under particular reply----------------------------------
  function handlereplies_replydislike(replies_reply_id, disc_replyid) {
    axiosInstance.post(`${ipaddress}/GroupDiscussionRepliesReplyDisLike/${user.user_id}/${replies_reply_id}/`)
      .then((r) => {
        // console.log("Organization Replies reply disliked",r.data)
        getreplies_for_reply(disc_replyid)
      })
      .catch(() => {
        console.log("Organization replies reply dislike error")
      })
  }
  // -----------------------------------------------------EDIT POSTS--------------------------------------------------------
  const [editedpost, setEditedpost] = useState("")
  const [discussionId, setdiscussionId] = useState(0)

  const editpostfunctionData = (value) => {
    setEditedpost(value)
  }

  const editPosts = (discid) => {
    // console.log("Discussion id",discid)
    setdiscussionId(discid)
    const foundDiscussion = userComments.find((x) => discid === x.id);

    if (foundDiscussion) {
      setEditedpost(foundDiscussion.content);
    }
  }

  const sendEditedData = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('discussion', editedpost);

    axiosInstance.patch(`${ipaddress}/NewGroupDiscussionView/${discussionId}/${user.user_id}/`, formData)
      .then((r) => {
        //  console.log("Post Edited Successfully",r.data)
        getusercomments()
        setCount((prev) => prev + 1)
        const toastLiveExample = document.getElementById('liveToast')
        document.getElementById('toastbody').style.color = "green"
        document.getElementById('toastbody').textContent = "Post Updated Succesfully!!!"
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        setindex1(-1)
      })
      .catch(() => {
        console.log("Post Editing Error")
      })

  };

  // -------------------------------------------GET REPLIES----------------------------------------------------------------
  const [fetchedreplies, setFetchedreplies] = useState([])
  const getreplies = (discussion_id, index) => {
    //  console.log(user.user_id)
    axiosInstance.get(`${ipaddress}/NewGroupDiscussionReplyView/${user.user_id}/${discussion_id}/${group_id}/`)
      .then((r) => {
        //  console.log("Group Replies fetched successfully",r.data)
        setFetchedreplies(r.data.reverse())
        getusercomments()
      })
  }

  // ----------------------------------Function to get the replies for the particular reply----------------------------------------------------------------
  const [fetchedreplies_for_reply, setFetchedreplies_for_reply] = useState([])
  const [replies_for_reply_status, setreplies_for_reply_status] = useState(false)

  const getreplies_for_reply = (particular_reply_id) => {
    axiosInstance.get(`${ipaddress}/GroupDiscussionRepliesReplyView/${user.user_id}/${particular_reply_id}/`)
      .then((r) => {
        console.log("Group Replies under reply fetched successfully", r.data)
        setFetchedreplies_for_reply(r.data.reverse())
        // setCount(count+1)
      })
  }

  // ---------------------------------------------------DELETE POST--------------------------------------------------------
  const deletePost = (discussion_id) => {
    axiosInstance.delete(`${ipaddress}/NewGroupDiscussionView/${discussion_id}/${user.user_id}/`)
      .then((r) => {
        console.log("Post Successfully Deleted")
        getusercomments()
        setCount((prev) => prev + 1)
        const toastLiveExample = document.getElementById('liveToast')
        document.getElementById('toastbody').style.color = "green"
        document.getElementById('toastbody').textContent = "Post Successfully Deleted!!!"
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        setindex1(-1)
      })
      .catch(() => {
        console.log("Post Delete Error")
      })
  }

  // ------------------------------------Functionality to delete the reply----------------------------------------------------

  const deleteReply = (disc_reply_id, discid) => {
    axiosInstance.delete(`${ipaddress}/NewGroupDiscussionReplyView/${user.user_id}/${disc_reply_id}/${group_id}/`)
      .then((r) => {
        console.log("Group Reply Successfully Deleted", r.data)
        getusercomments()
        setCount((prev) => prev + 1)
        const toastLiveExample = document.getElementById('liveToast')
        document.getElementById('toastbody').style.color = "green"
        document.getElementById('toastbody').textContent = "Reply Succesfully Deleted!!!"
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        getreplies(discid)
      })
      .catch(() => {
        console.log("Reply Delete Error")
      })
  }

  // -------------------------------To Delete the reply under specific reply in the discussion--------------------------------------------------------

  const deleteReply_for_reply = (reply_reply_id, disc_reply_id, discid) => {
    axiosInstance.delete(`${ipaddress}/GroupDiscussionRepliesReplyView/${user.user_id}/${reply_reply_id}/`)
      .then((r) => {
        console.log("Replies reply deleted successfully", r.data)
        const toastLiveExample = document.getElementById('liveToast')
        document.getElementById('toastbody').textContent = "Reply Successfully Deleted"
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        getreplies(discid)
        getreplies_for_reply(disc_reply_id)
      })
      .catch((err) => {
        console.log("Replies reply Delete Error", err)
      })
  }

  // -------------------------------------------PINNING COMMENTS------------------------------------------------------------
  const pincomment = (discId) => {
    axiosInstance.post(`${ipaddress}/UserPinnedComments/${user.user_id}/${group_id}/${discId}/`)
      .then((r) => {
        console.log("Pinned Successfully", r.data)
        if (r.data.message === 'already Pinned') {
          const toastLiveExample = document.getElementById('liveToast')
          document.getElementById('toastbody').style.color = "green"
          document.getElementById('toastbody').textContent = "Comment already followed!!!"
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
          toastBootstrap.show()
          setindex1(-1)
          getusercomments()
        }
        else {
          getusercomments()
          const toastLiveExample = document.getElementById('liveToast')
          document.getElementById('toastbody').style.color = "green"
          document.getElementById('toastbody').textContent = "Comment Followed Succesfully!!!"
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
          toastBootstrap.show()
          setindex1(-1)
        }
      })
  }

  useEffect(() => {
    fetchgroupdetails()
  }, [])

  // ---------------------------------------------------UNPIN COMMENT-------------------------------------------------------
  const unpin = (discid) => {
    axiosInstance.delete(`${ipaddress}/UserPinnedComments/${user.user_id}/${group_id}/${discid}/`)
      .then((r) => {
        console.log("UnPinned Successfully", r.data)
        getusercomments()
        setCount((prev) => prev + 1)
      })
      .catch(() => {
        console.log("Unpinning error")
      })
  }

  const navigate = useNavigate()
  const [selectedReply, setSelectedReply] = useState(null);
  const [selectedReplyOfReply, setSelectedReplyOfReply] = useState(null);
  return (
    <div className={`${usercomments_status ? '' : 'd-none'}`}>
      {((userComments && userComments.length == 0) && usercomments_status == true) &&
        <>
          <img src="https://starlight-b3f27.web.app/assets/images/nodataimg.svg" className='not-found-image' />
          <h6 className={`text-center py-3 ${userComments.length > 0 ? 'd-none' : 'py-3'}`} style={{ color: '#5d5fe3', fontSize: '14px' }}>Post your comments ...💬</h6>
        </>
      }
      <h6 className={`pt-2 ${userComments.length > 0 ? '' : 'd-none'}`} style={{ color: '#5d5fe3' }}>Your Comments</h6>
      {userComments.map((x, index) => {
        return (
          <div className='' key={index}>
            <div className='col-12 rounded shadow-sm border mb-3 bg-white'>
              <div className="d-flex justify-content-between border-bottom py-2 ps-2 m-0 align-items-center">
                <div className='d-flex gap-2 align-items-center'>
                  <div className="d-flex justify-content-center" onClick={() => {
                    setindex1(-1)
                  }}>
                    <img src={x.sender.profile_pic} className={x.sender.profile_pic == null ? 'd-none' : 'rounded-circle'} width={40} height={40} alt="grp-diss" />
                    {x.sender.nickname && (<p className={x.sender.profile_pic == null ? 'd-inine bg-warning text-white p-2 rounded-circle my-auto' : 'd-none'}><span>{x.sender.nickname.slice(0, 1)}</span><span>{x.sender.nickname.slice(-1)}</span></p>)}

                  </div>
                  <div className={``} onClick={() => {
                    setindex1(-1)
                  }}>
                    <Link to={`/profile/${x.sender.user_id}`} className='my-0 fw-medium text-decoration-none text-dark' style={{ fontSize: '14px' }}>{x.sender.nickname}
                      <span className='fw-normal ms-2 text-secondary' style={{ fontSize: '13px' }}>{x.created_at}</span>
                    </Link>

                  </div>
                </div>

                <div className={`col-2 gap-2 ${x.pinned_status ? 'col-md-3 justify-content-end' : 'col-md-2 justify-content-end'} d-flex align-items-center p-0`} style={{ position: 'relative' }}>
                  <p className='my-0 d-flex align-items-center' style={{ fontSize: '12px', color: '#8587EA', cursor: 'pointer' }} onClick={() => {
                    navigate(`/profile/${x.sender.user_id}`)
                  }}> <span className={`ms-2 edit ${x.edited ? '' : 'd-none'}`}>Edited</span></p>
                  <button data-bs-toggle="tooltip" data-bs-placement="top"
                    data-bs-custom-class="custom-tooltip"
                    data-bs-title="Unfollow" onClick={() => {
                      unpin(x.id)
                    }} className={`p-1 btn btn-sm border px-2 ${x.pinned_status ? '' : 'd-none'}`} style={{ cursor: 'pointer' }}><i className="fa-solid fa-link-slash d-md-none d-inline"></i><span className='d-none d-md-inline'>Followed</span></button>


                  <div className="btn-group dropstart">
                    <span className={`border-0`} type="button" style={{ cursor: 'pointer' }} onClick={() => {
                      if (index1 == index)
                        setindex1(-1)
                      else
                        setindex1(index)
                    }}>
                      <img src={require('../img/more.png')} width={30} height={30} alt="grp-diss" />
                    </span>
                    <ul className={`bg-white shadow-sm border rounded mt-0 p-0 px-3 ${index1 == index ? '' : 'd-none'}`} style={{ width: '160px', position: 'absolute', left: '-160px' }}>
                      <button className={x.sender.user_id != user.user_id || x.created_at.includes("day") || x.created_at.includes("week") || x.created_at.includes("year") ? 'd-none' : 'd-flex align-items-center bg-transparent border-0 my-2'} data-bs-toggle="modal" data-bs-target="#editModal1" onClick={() => {
                        editPosts(x.id)
                      }} style={{ height: '20px' }}><span className='dropdownmenu'><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 30 30" fill="none">
                        <path d="M6.25 23.75H7.62259L20.9952 10.3774L19.6226 9.00481L6.25 22.3774V23.75ZM5 25V21.851L21.476 5.35816C21.604 5.24397 21.7454 5.15573 21.9001 5.09344C22.0549 5.03115 22.2162 5 22.3841 5C22.552 5 22.7146 5.02644 22.8721 5.07931C23.0295 5.13221 23.1747 5.22756 23.3077 5.36538L24.6418 6.70672C24.7797 6.83974 24.8738 6.98566 24.9243 7.14447C24.9748 7.30328 25 7.46209 25 7.62091C25 7.7903 24.9714 7.95236 24.9143 8.10709C24.8573 8.26182 24.7664 8.40321 24.6418 8.53125L8.14903 25H5ZM20.2968 9.70316L19.6226 9.00481L20.9952 10.3774L20.2968 9.70316Z" fill="black" />
                      </svg></span><span className="ms-2">{translate_value.common_words.edit}</span></button>

                      <button className={`bg-transparent border-0 my-2 ${x.pinned_status ? 'd-none' : 'd-flex align-items-center'}`} onClick={() => {
                        pincomment(x.id)
                      }} style={{ height: '20px' }}><span className='dropdownmenu'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pin" viewBox="0 0 16 16">
                        <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354m1.58 1.408-.002-.001zm-.002-.001.002.001A.5.5 0 0 1 6 2v5a.5.5 0 0 1-.276.447h-.002l-.012.007-.054.03a5 5 0 0 0-.827.58c-.318.278-.585.596-.725.936h7.792c-.14-.34-.407-.658-.725-.936a5 5 0 0 0-.881-.61l-.012-.006h-.002A.5.5 0 0 1 10 7V2a.5.5 0 0 1 .295-.458 1.8 1.8 0 0 0 .351-.271c.08-.08.155-.17.214-.271H5.14q.091.15.214.271a1.8 1.8 0 0 0 .37.282" />
                      </svg> </span><span className="ms-2">Follow</span></button>

                      <button className={`bg-transparent border-0 my-2 ${user.user_id === x.sender.user_id ? ' d-flex align-items-center' : 'd-none'}`} onClick={() => {
                        deletePost(x.id)
                      }} style={{ height: '20px' }}><span className='dropdownmenu'><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 30 30" fill="none">
                        <path d="M9.51922 24.9996C8.95993 24.9996 8.48356 24.8029 8.09013 24.4095C7.69671 24.0161 7.5 23.5397 7.5 22.9804V7.49965H6.25V6.24965H11.25V5.28809H18.75V6.24965H23.75V7.49965H22.5V22.9804C22.5 23.5557 22.3073 24.0361 21.9219 24.4215C21.5365 24.8069 21.0561 24.9996 20.4808 24.9996H9.51922ZM21.25 7.49965H8.75V22.9804C8.75 23.2048 8.82211 23.3891 8.96634 23.5333C9.11057 23.6775 9.29486 23.7496 9.51922 23.7496H20.4808C20.6731 23.7496 20.8494 23.6695 21.0096 23.5093C21.1699 23.349 21.25 23.1727 21.25 22.9804V7.49965ZM12.2596 21.2496H13.5096V9.99965H12.2596V21.2496ZM16.4904 21.2496H17.7404V9.99965H16.4904V21.2496Z" fill="black" />
                      </svg></span><span className="ms-2">{translate_value.common_words.delete}</span></button>
                    </ul>
                  </div>

                  {/* ---------------------------------------Edit post section (Edit the Post for 24 hours)--------------------------------------------- */}

                  <div className="modal fade" id="editModal1" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                      <div className="modal-content">
                        <div className="modal-body">
                          <div className=' bg-white px-3 pt-2 pb-3 rounded'>
                            <h6 className='pb-2 ps-1'>Edit the Post</h6>
                            <div className='d-flex gap-3'>
                              <img src={userdetails.profile_pic} className={userdetails.profile_pic == null ? 'd-none' : 'rounded-circle'} width={40} height={40} alt="grp-diss" />
                              {userdetails.nickname != undefined ? (<p className={userdetails.profile_pic == null ? 'd-flex justify-content-center align-items-center bg-warning text-white rounded-circle my-auto' : 'd-none'} style={{ height: '40px', width: '40px' }}><span>{userdetails.nickname.slice(0, 1)}</span><span>{userdetails.nickname.slice(-1)}</span></p>) : (<></>)}
                              <form onSubmit={(e) => sendEditedData(e, x.id)} className='w-100'>
                                <div className="input-group bg-light border rounded pe-3">
                                  <input
                                    type="text"
                                    name="question"
                                    onChange={(e) => editpostfunctionData(
                                      e.target.value
                                    )}
                                    value={editedpost}
                                    className="form-control bg-transparent py-3 ps-3 shadow-none border-0" placeholder="Ask a question....."
                                    style={{ position: 'relative' }} />
                                  <button type='submit' data-bs-dismiss="modal" disabled={editedpost.length > 0 ? false : true} className='text-secondary bg-transparent border-0'> <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 30 30" fill="none">
                                    <path d="M5 23.125V6.875L24.2789 15L5 23.125ZM6.25 21.25L21.0625 15L6.25 8.75V13.6058L12.3077 15L6.25 16.3942V21.25Z" fill="#8E9696" />
                                  </svg></button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* END OF EDIT POST */}
                </div>
              </div>
              <div className='py-2 px-2' onClick={() => {
                setindex1(-1)
              }}>
                <p className='m-0' id={x.id}>{x.content}</p>
                {x.images_attached && (
                  x.images_attached.map((z) => {
                    return (
                      <div>
                        <img src={z.images} width={200} alt="grp-diss" className='mt-3' />
                      </div>
                    )
                  })
                )}

              </div>
              <div className='d-flex justify-content-between border-bottom px-2 pb-2 mb-0' onClick={() => {
                setindex1(-1)
              }}>
                <div className="d-flex align-items-center gap-2">
                  <button className={`bg-transparent border-0 d-flex align-items-center`} style={{ height: '20px', color: x.liked_status ? "#ff845d" : "gray" }} onClick={() => {
                    if (x.liked_status == true) {
                      handleLike1(x.id)
                    }
                    else {
                      handleLike(x.id)
                    }
                  }}><svg xmlns="http://www.w3.org/2000/svg" width="25" height="22" viewBox="0 0 25 22" fill="none">
                      <path d="M18.8269 22.0002H6.27884V8.25017L14.1154 0.509766L14.6683 1.06267C14.7821 1.17644 14.8778 1.32228 14.9555 1.50017C15.0333 1.67805 15.0721 1.84151 15.0721 1.99055V2.18767L13.7933 8.25017H22.4808C23.0032 8.25017 23.4704 8.4561 23.8822 8.86795C24.2941 9.27981 24.5 9.74695 24.5 10.2694V11.8079C24.5 11.9217 24.4872 12.0459 24.4615 12.1805C24.4359 12.3151 24.4023 12.4393 24.3606 12.553L20.9471 20.6444C20.7756 21.029 20.4872 21.3511 20.0818 21.6108C19.6763 21.8704 19.258 22.0002 18.8269 22.0002ZM7.52884 20.7502H18.8269C19.0032 20.7502 19.1835 20.7021 19.3678 20.606C19.5521 20.5098 19.6923 20.3495 19.7885 20.1252L23.25 12.0002V10.2694C23.25 10.045 23.1779 9.86074 23.0337 9.71652C22.8894 9.57229 22.7051 9.50017 22.4808 9.50017H12.2404L13.6875 2.67324L7.52884 8.78383V20.7502ZM6.27884 8.25017V9.50017H2V20.7502H6.27884V22.0002H0.75V8.25017H6.27884Z" fill="currentColor" />
                    </svg> <span className='ms-1'>{x.likes_count}</span></button>

                  <button className={`bg-transparent border-0`} style={{ height: '20px', color: x.dis_liked_status ? "#ff845d" : "gray" }} onClick={() => {
                    if (x.dis_liked_status == true) {
                      handledislike1(x.id)
                    }
                    else {
                      handledislike(x.id)
                    }
                  }}><svg xmlns="http://www.w3.org/2000/svg" width="25" height="22" viewBox="0 0 25 22" fill="none">
                      <path d="M6.17306 -0.000173569H18.7212V13.7498L10.8846 21.4902L10.3317 20.9373C10.2179 20.8236 10.1222 20.6777 10.0445 20.4998C9.96674 20.322 9.92788 20.1585 9.92788 20.0095V19.8123L11.2067 13.7498H2.51922C1.99678 13.7498 1.52963 13.5439 1.11778 13.132C0.705927 12.7202 0.5 12.253 0.5 11.7306V10.1921C0.5 10.0783 0.512823 9.95415 0.538469 9.81955C0.564095 9.68492 0.59774 9.56072 0.639406 9.44695L4.05288 1.35558C4.22435 0.970972 4.51281 0.648857 4.91825 0.389233C5.32371 0.129627 5.74198 -0.000173569 6.17306 -0.000173569ZM17.4712 1.24983H6.17306C5.99679 1.24983 5.81651 1.2979 5.63222 1.39404C5.44793 1.49021 5.3077 1.65047 5.21153 1.87483L1.75 9.99983V11.7306C1.75 11.955 1.82211 12.1393 1.96634 12.2835C2.11057 12.4277 2.29486 12.4998 2.51922 12.4998H12.7596L11.3125 19.3268L17.4712 13.2162V1.24983ZM18.7212 13.7498V12.4998H23V1.24983H18.7212V-0.000173569H24.25V13.7498H18.7212Z" fill="currentColor" />
                    </svg></button>
                </div>

                {x.reply_count > 0 ?
                  (!replies_layout) ?
                    <button className='bg-transparent border-0 fw-bold' style={{ color: '#5D5FE3', fontSize: '14px' }} onClick={(e) => { setreplies_layout(!replies_layout); setSelectedReply(index); getreplies(x.id, index) }}>
                      {translate_value.dashboard.view_all} {x.reply_count} {translate_value.dashboard.replies}
                    </button>
                    :
                    (selectedReply == index) ?
                      <button className='bg-transparent border-0 fw-bold' style={{ color: '#5D5FE3', fontSize: '14px' }} onClick={(e) => { setreplies_layout(!replies_layout); setSelectedReply(null); }}>
                        {`View less`}
                      </button> :
                      <button className='bg-transparent border-0 fw-bold' style={{ color: '#5D5FE3', fontSize: '14px' }} onClick={(e) => { setreplies_layout(!replies_layout); setSelectedReply(index); getreplies(x.id, index) }}>
                        {translate_value.dashboard.view_all} {x.reply_count} {translate_value.dashboard.replies}
                      </button>
                  : <p></p>
                }
              </div>

              {fetchedreplies && fetchedreplies.length > 0 && (
                <div className={fetchedreplies[0].group_messages == x.id && replies_layout ? 'd-block' : 'd-none'}>
                  {fetchedreplies.map((y, index2) => {

                    return (
                      <div className='px-2 py-2 bg-white' onClick={() => {
                        setindex1(-1)
                      }}>
                        <div className="px-2 d-flex justify-content-between w-100 align-items-center">
                          <div className='d-flex gap-2'>
                            <div className="d-flex justify-content-end">
                              <img src={y.user_id.profile_pic} className={y.user_id.profile_pic == null ? 'd-none' : 'rounded-circle'} width={30} height={30} alt="grp-diss" />
                              <p className={y.user_id.profile_pic == null ? 'bg-info text-white rounded-circle my-auto d-flex justify-content-center align-items-center' : 'd-none'}
                                style={{ fontSize: '14px', height: '35px', width: '35px' }}><span>{y.user_id.nickname.slice(0, 1)}</span><span>{y.user_id.nickname.slice(-1)}</span></p>
                            </div>
                            <div className="">
                              <h6 className='ms-sm-0 my-0' style={{ fontSize: '13px' }}>{y.user_id.nickname}</h6>
                              <p className='ms-sm-0 my-0' style={{ fontSize: '13px' }}>{y.created_at}</p>
                            </div>
                          </div>

                          <div className="d-flex gap-3 justify-content-between align-items-center">
                            <button className={`bg-transparent border-0 d-flex align-items-center`} style={{ height: '20px', color: y.like_status ? "#ff845d" : "gray" }} onClick={() => {
                              if (y.like_status == true) {
                                handleReplyLike1(y.id, x.id, index)
                              }
                              else {
                                handleReplyLike(y.id, x.id, index)
                              }
                            }}><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 30 30" fill="none">
                                <path d="M18.8269 22.0002H6.27884V8.25017L14.1154 0.509766L14.6683 1.06267C14.7821 1.17644 14.8778 1.32228 14.9555 1.50017C15.0333 1.67805 15.0721 1.84151 15.0721 1.99055V2.18767L13.7933 8.25017H22.4808C23.0032 8.25017 23.4704 8.4561 23.8822 8.86795C24.2941 9.27981 24.5 9.74695 24.5 10.2694V11.8079C24.5 11.9217 24.4872 12.0459 24.4615 12.1805C24.4359 12.3151 24.4023 12.4393 24.3606 12.553L20.9471 20.6444C20.7756 21.029 20.4872 21.3511 20.0818 21.6108C19.6763 21.8704 19.258 22.0002 18.8269 22.0002ZM7.52884 20.7502H18.8269C19.0032 20.7502 19.1835 20.7021 19.3678 20.606C19.5521 20.5098 19.6923 20.3495 19.7885 20.1252L23.25 12.0002V10.2694C23.25 10.045 23.1779 9.86074 23.0337 9.71652C22.8894 9.57229 22.7051 9.50017 22.4808 9.50017H12.2404L13.6875 2.67324L7.52884 8.78383V20.7502ZM6.27884 8.25017V9.50017H2V20.7502H6.27884V22.0002H0.75V8.25017H6.27884Z" fill="currentColor" />
                              </svg> <span className='ms-1'>{y.likes_count}</span></button>

                            <button className={`bg-transparent border-0`} style={{ height: '20px', color: y.dis_like_status ? "#ff845d" : "gray" }} onClick={() => {
                              handleReplyDisLike(y.id, x.id, index)
                            }}><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 30 30" fill="none">
                                <path d="M6.17306 -0.000173569H18.7212V13.7498L10.8846 21.4902L10.3317 20.9373C10.2179 20.8236 10.1222 20.6777 10.0445 20.4998C9.96674 20.322 9.92788 20.1585 9.92788 20.0095V19.8123L11.2067 13.7498H2.51922C1.99678 13.7498 1.52963 13.5439 1.11778 13.132C0.705927 12.7202 0.5 12.253 0.5 11.7306V10.1921C0.5 10.0783 0.512823 9.95415 0.538469 9.81955C0.564095 9.68492 0.59774 9.56072 0.639406 9.44695L4.05288 1.35558C4.22435 0.970972 4.51281 0.648857 4.91825 0.389233C5.32371 0.129627 5.74198 -0.000173569 6.17306 -0.000173569ZM17.4712 1.24983H6.17306C5.99679 1.24983 5.81651 1.2979 5.63222 1.39404C5.44793 1.49021 5.3077 1.65047 5.21153 1.87483L1.75 9.99983V11.7306C1.75 11.955 1.82211 12.1393 1.96634 12.2835C2.11057 12.4277 2.29486 12.4998 2.51922 12.4998H12.7596L11.3125 19.3268L17.4712 13.2162V1.24983ZM18.7212 13.7498V12.4998H23V1.24983H18.7212V-0.000173569H24.25V13.7498H18.7212Z" fill="currentColor" />
                              </svg></button>
                            <button className={user.user_id === y.user_id.user_id ? 'bg-transparent border-0 d-flex align-items-center' : 'd-none'} onClick={() => {
                              deleteReply(y.id, x.id)
                            }} style={{ height: '20px' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 20" fill="none">
                                <path d="M3.51922 19.9996C2.95993 19.9996 2.48356 19.8029 2.09013 19.4095C1.69671 19.0161 1.5 18.5397 1.5 17.9804V2.49965H0.25V1.24965H5.25V0.288086H12.75V1.24965H17.75V2.49965H16.5V17.9804C16.5 18.5557 16.3073 19.0361 15.9219 19.4215C15.5365 19.8069 15.0561 19.9996 14.4808 19.9996H3.51922ZM15.25 2.49965H2.75V17.9804C2.75 18.2048 2.82211 18.3891 2.96634 18.5333C3.11057 18.6775 3.29486 18.7496 3.51922 18.7496H14.4808C14.6731 18.7496 14.8494 18.6695 15.0096 18.5093C15.1699 18.349 15.25 18.1727 15.25 17.9804V2.49965ZM6.25959 16.2496H7.50963V4.99965H6.25959V16.2496ZM10.4904 16.2496H11.7404V4.99965H10.4904V16.2496Z" fill="#8E9696" />
                              </svg></button>
                          </div>
                        </div>
                        <div className='ps-5 mt-2'>
                          <p className='m-0' style={{ fontSize: '14px' }}>{y.post}</p>
                          {y.images_attached.map((a) => {
                            return (
                              <div className=''>
                                <img src={a.images} width={300} alt="grp-diss" className='mt-3' />
                              </div>
                            )
                          })}
                        </div>

                        {/* -----------------------------------------------Replies for Reply layout----------------------------------------------- */}
                        <div className="mt-2 ps-5">
                          <span data-bs-toggle="modal" data-bs-target="#replyforreply_modal3" onClick={() => {
                            setdiscuss_id(x.id)
                            setreply_id(y.id)
                          }} style={{ cursor: 'pointer' }} className="reply_for_reply fw-bold d-flex align-items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M19 18.0001V15.0001C19 14.0385 18.6571 13.2148 17.9712 12.5289C17.2853 11.843 16.4615 11.5001 15.5 11.5001H5.92115L10.0212 15.6001L9.3077 16.3078L4 11.0001L9.3077 5.69238L10.0212 6.40008L5.92115 10.5001H15.5C16.7423 10.5001 17.8029 10.9395 18.6817 11.8184C19.5606 12.6972 20 13.7578 20 15.0001V18.0001H19Z" fill="#2A3941" />
                            </svg> <span className="ms-1">Reply</span></span>

                          {/* <p style={{ cursor: 'pointer' }} className={`view_reply_for_reply mt-2 mb-0 ${y.replies_count > 0 ? '' : 'd-none'}`} onClick={() => {
                            setreplies_for_reply_status(!replies_for_reply_status)
                            getreplies_for_reply(y.id)
                          }}>---View {y.replies_count} replies
                          </p> */}
                          {!replies_for_reply_status ?
                            <p style={{ cursor: 'pointer' }} className={`view_reply_for_reply mt-2 mb-0 ${y.replies_count > 0 ? '' : 'd-none'}`} onClick={() => { setreplies_for_reply_status(!replies_for_reply_status); getreplies_for_reply(y.id); setSelectedReplyOfReply(index2) }}>
                              ---View {y.replies_count} replies
                            </p>
                            :
                            selectedReplyOfReply == index2 ?
                              <p style={{ cursor: 'pointer' }} className={`view_reply_for_reply mt-2 mb-0 ${y.replies_count > 0 ? '' : 'd-none'}`} onClick={() => { setreplies_for_reply_status(!replies_for_reply_status); getreplies_for_reply(y.id); setSelectedReplyOfReply(null) }}>
                                {'View less'}
                              </p>
                              :
                              <p style={{ cursor: 'pointer' }} className={`view_reply_for_reply mt-2 mb-0 ${y.replies_count > 0 ? '' : 'd-none'}`} onClick={() => { setreplies_for_reply_status(!replies_for_reply_status); getreplies_for_reply(y.id); setSelectedReplyOfReply(index2) }}>
                                ---View {y.replies_count} replies
                              </p>
                          }
                          {fetchedreplies_for_reply && fetchedreplies_for_reply.length > 0 && (
                            <div className={fetchedreplies_for_reply[0].reply == y.id && replies_for_reply_status ? 'd-block' : 'd-none'}>
                              {fetchedreplies_for_reply.map((z) => {

                                return (
                                  <div className='py-2 px-2 bg-white' onClick={() => {
                                    setindex1(-1)
                                  }} >
                                    <div className="d-flex justify-content-between w-100 align-items-center">
                                      <div className='d-flex gap-2'>
                                        <div className="d-flex justify-content-center">
                                          <img src={z.user_id.profile_pic} className={z.user_id.profile_pic == null ? 'd-none' : 'rounded-circle'} width={30} height={30} alt="grp-diss" />
                                          <p className={z.user_id.profile_pic == null ? 'bg-info text-white rounded-circle my-auto d-flex justify-content-center align-items-center' : 'd-none'} style={{ fontSize: '14px', height: '30px', width: '30px' }}><span>{z.user_id.nickname.slice(0, 1)}</span><span>{z.user_id.nickname.slice(-1)}</span></p>
                                        </div>
                                        <div className="">
                                          <h6 className='ms-sm-0 my-0' style={{ fontSize: '12px' }}>
                                            <Link to={`/profile/${z.user_id.user_id}`} className="text-decoration-none text-dark">{z.user_id.nickname}</Link>
                                          </h6>
                                          <p className='ms-sm-0 my-0' style={{ fontSize: '13px' }}>{z.created_at}</p>
                                        </div>
                                      </div>

                                      <div className="d-flex gap-3 justify-content-between align-items-center">
                                        <button className='bg-transparent border-0 d-flex align-items-center' style={{ height: '20px', color: z.liked_status ? "#ff845d" : "gray" }} onClick={() => {
                                          handleReplies_reply_like(z.id, y.id)
                                        }}><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 30 30" fill="none">
                                            <path d="M21.8269 24.9999H9.27884V11.2499L17.1154 3.50952L17.6683 4.06243C17.7821 4.1762 17.8778 4.32203 17.9555 4.49993C18.0333 4.6778 18.0721 4.84126 18.0721 4.9903V5.18743L16.7933 11.2499H25.4808C26.0032 11.2499 26.4704 11.4559 26.8822 11.8677C27.2941 12.2796 27.5 12.7467 27.5 13.2691V14.8076C27.5 14.9214 27.4872 15.0456 27.4615 15.1802C27.4359 15.3148 27.4023 15.439 27.3606 15.5528L23.9471 23.6442C23.7756 24.0288 23.4872 24.3509 23.0818 24.6105C22.6763 24.8701 22.258 24.9999 21.8269 24.9999ZM10.5288 23.7499H21.8269C22.0032 23.7499 22.1835 23.7019 22.3678 23.6057C22.5521 23.5095 22.6923 23.3493 22.7885 23.1249L26.25 14.9999V13.2691C26.25 13.0448 26.1779 12.8605 26.0337 12.7163C25.8894 12.572 25.7051 12.4999 25.4808 12.4999H15.2404L16.6875 5.67299L10.5288 11.7836V23.7499ZM9.27884 11.2499V12.4999H5V23.7499H9.27884V24.9999H3.75V11.2499H9.27884Z" fill="currentColor" />
                                          </svg> <span className="ms-1" style={{ fontSize: '14px' }}>{z.reply_likes}</span></button>
                                        <button className='bg-transparent border-0 d-flex align-items-center' style={{ height: '20px', color: z.dis_liked_status ? "#ff845d" : "gray" }} onClick={() => {
                                          handlereplies_replydislike(z.id, y.id)
                                        }}><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 30 30" fill="none">
                                            <path d="M8.17306 5.00007H20.7212V18.7501L12.8846 26.4905L12.3317 25.9376C12.2179 25.8238 12.1222 25.678 12.0445 25.5001C11.9667 25.3222 11.9279 25.1587 11.9279 25.0097V24.8126L13.2067 18.7501H4.51922C3.99678 18.7501 3.52963 18.5441 3.11778 18.1323C2.70593 17.7204 2.5 17.2533 2.5 16.7309V15.1924C2.5 15.0786 2.51282 14.9544 2.53847 14.8198C2.56409 14.6852 2.59774 14.561 2.63941 14.4472L6.05288 6.35582C6.22435 5.97122 6.51281 5.6491 6.91825 5.38948C7.32371 5.12987 7.74198 5.00007 8.17306 5.00007ZM19.4712 6.25007H8.17306C7.99679 6.25007 7.81651 6.29814 7.63222 6.39429C7.44793 6.49046 7.3077 6.65072 7.21153 6.87507L3.75 15.0001V16.7309C3.75 16.9552 3.82211 17.1395 3.96634 17.2837C4.11057 17.428 4.29486 17.5001 4.51922 17.5001H14.7596L13.3125 24.327L19.4712 18.2164V6.25007ZM20.7212 18.7501V17.5001H25V6.25007H20.7212V5.00007H26.25V18.7501H20.7212Z" fill="currentColor" />
                                          </svg></button>
                                        <button className={user.first_name === z.user_id.first_name ? 'bg-transparent border-0 d-flex align-items-center' : 'd-none'} onClick={() => {
                                          deleteReply_for_reply(z.id, y.id, x.id)
                                        }} style={{ height: '20px' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 18 20" fill="none">
                                            <path d="M3.51922 19.9996C2.95993 19.9996 2.48356 19.8029 2.09013 19.4095C1.69671 19.0161 1.5 18.5397 1.5 17.9804V2.49965H0.25V1.24965H5.25V0.288086H12.75V1.24965H17.75V2.49965H16.5V17.9804C16.5 18.5557 16.3073 19.0361 15.9219 19.4215C15.5365 19.8069 15.0561 19.9996 14.4808 19.9996H3.51922ZM15.25 2.49965H2.75V17.9804C2.75 18.2048 2.82211 18.3891 2.96634 18.5333C3.11057 18.6775 3.29486 18.7496 3.51922 18.7496H14.4808C14.6731 18.7496 14.8494 18.6695 15.0096 18.5093C15.1699 18.349 15.25 18.1727 15.25 17.9804V2.49965ZM6.25959 16.2496H7.50963V4.99965H6.25959V16.2496ZM10.4904 16.2496H11.7404V4.99965H10.4904V16.2496Z" fill="#8E9696" />
                                          </svg></button>
                                      </div>
                                    </div>
                                    <div className='ps-5 mt-2'>
                                      <p className='m-0' style={{ fontSize: '14px' }}>{z.post}</p>
                                      {z.images_attached.map((b) => {
                                        return (
                                          <div className='d-flex justify-content-center'>
                                            <img src={b.Group_Discussion_Replies_Reply_Images} width={260} alt="grp-diss" className='mt-3' />
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}

                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                </div>
              )}


              {/* To post the replies for the particular comment under the discussion */}
              <form onSubmit={(e) => { postReplies(e, x.id, index); }}>
                <div onClick={() => {
                  setindex1(-1)
                }} className='d-flex gap-2 px-2 py-2 border-secondary-subtle align-items-center'>
                  <img src={userdetails.profile_pic} className={userdetails.profile_pic == null ? 'd-none' : 'rounded-circle'} width={40} height={40} alt="grp-diss" />
                  {userdetails.nickname != undefined ? (<p className={userdetails.profile_pic == null ? 'd-flex justify-content-center align-items-center bg-warning text-white rounded-circle my-auto' : 'd-none'} style={{ height: '40px', width: '40px' }}><span>{userdetails.nickname.slice(0, 1)}</span><span>{userdetails.nickname.slice(-1)}</span></p>) : (<></>)}
                  <div className="input-group border rounded pe-lg-3 bg-light">
                    <input key={index}
                      type="text"
                      onChange={(e) => { repliesData(e); setSelectedPostForComment(x.id) }}
                      className="form-control py-2 ps-3 shadow-none border-0 bg-light user_reply-input" placeholder={translate_value.dashboard.reply_here}
                      style={{ position: 'relative' }} />
                    <div className='d-flex align-items-center bg-light'>
                      <input
                        id="file3"
                        type='file'
                        name='file'
                        accept="image/*"
                        multiple
                        onChange={handleReplyImage3}
                        className="bg-light text-center p-3 btn"
                      />
                      <label data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-custom-class="custom-tooltip"
                        data-bs-title="Attach Image"
                        htmlFor='file3'
                        className="text-white px-lg-4 py-2" style={{ cursor: 'pointer' }}
                      ><img src={require('../img/attachment.png')} width={22} height={22} alt="grp-diss" /></label>
                      <button disabled={replies.length > 0 ? false : true}

                        className='h-100 bg-transparent border-0 ms-2'
                      >
                        <div style={{ width: '30px' }} className={`${(load && selectedPostForComment == x.id) ? '' : 'd-none'}`}>
                          <div className={`spinner-border spinner-border-sm`} role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                        <svg data-bs-toggle="tooltip" data-bs-placement="top"
                          data-bs-custom-class="custom-tooltip"
                          data-bs-title="Post" xmlns="http://www.w3.org/2000/svg" className={`${(load && selectedPostForComment == x.id) ? 'd-none' : ''}`} width="25" height="25" viewBox="0 0 30 30" fill="none">
                          <path d="M5 23.125V6.875L24.2789 15L5 23.125ZM6.25 21.25L21.0625 15L6.25 8.75V13.6058L12.3077 15L6.25 16.3942V21.25Z" fill="#8E9696" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              {(repliesImage3 && repliesImage3.length > 0) &&
                <div className='d-flex gap-3 mt-3'>
                  {repliesImage3.length > 0 &&
                    repliesImage3.map((image, index) => (
                      <div key={index} className="image-preview bg-light p-2" style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(image)} width={50} alt={`Selected Image ${index + 1}`} />
                        <button style={{ position: 'absolute', top: '-10px', right: '-16px' }} className='btn btn-sm' onClick={() => removeImage3(index)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                        </svg></button>
                      </div>
                    ))
                  }
                </div>
              }
            </div>
          </div>
        )
      })}

      {/* -----------------------------------------------To post the reply for reply modal------------------------------------------ */}
      <div className="modal fade" id="replyforreply_modal3" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">

        <div className="modal-dialog  modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <div className='col-12 bg-white px-lg-3 pt-2 pb-3'>
                <h6 className='pb-2 ps-1'>Post a Reply for Reply</h6>
                <form onSubmit={(e) => { postreply_for_replies(e) }}>
                  <div className='d-flex gap-lg-3 gap-1 align-items-center'>
                    <img src={userdetails.profile_pic} className={userdetails.profile_pic == null ? 'd-none' : 'rounded-circle'} width={40} height={40} alt="grp-diss" />
                    {userdetails.nickname != undefined ? (<p className={userdetails.profile_pic == null ? 'd-flex justify-content-center align-items-center bg-warning text-white rounded-circle my-auto' : 'd-none'} style={{ height: '40px', width: '40px' }}><span>{userdetails.nickname.slice(0, 1)}</span><span>{userdetails.nickname.slice(-1)}</span></p>) : (<></>)}
                    <div className="input-group bg-light border rounded pe-lg-3">
                      <input
                        type="text"
                        name="question"
                        value={reply_for_reply}
                        onChange={(e) => {
                          setReply_for_reply(e.target.value)
                        }}
                        className="form-control py-3 ps-3 bg-light border-0 shadow-none post-input" placeholder="Post your reply....."
                        style={{ position: 'relative' }} />
                      <div className='d-flex align-items-center bg-light'>
                        <input
                          id="fileInput3"
                          type='file'
                          name='file'
                          accept="image/*"
                          multiple
                          onChange={handleReply_reply_Image3}
                          className="bg-light text-center p-3 btn"
                        />
                        <label data-bs-toggle="tooltip" data-bs-placement="top"
                          data-bs-custom-class="custom-tooltip"
                          data-bs-title="Attach Image"
                          htmlFor="fileInput3"
                          className="custom-file-input bg-transparent border-0 px-lg-4 py-2">
                          <img src={require('../img/attachment.png')} width={22} height={22} alt="grp-diss" />
                        </label>
                        <button data-bs-dismiss="modal" disabled={reply_for_reply.length > 0 ? false : true} className='text-secondary h-100 bg-transparent border-0 ms-2 outline-0' >
                          <svg data-bs-toggle="tooltip" data-bs-placement="top"
                            data-bs-custom-class="custom-tooltip"
                            data-bs-title="Post" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 30 30" fill="none">
                            <path d="M5 23.125V6.875L24.2789 15L5 23.125ZM6.25 21.25L21.0625 15L6.25 8.75V13.6058L12.3077 15L6.25 16.3942V21.25Z" fill="#8E9696" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>
                </form>

                <div className='d-flex gap-3 mt-3'>
                  {replies_reply_Image3.length > 0 &&
                    replies_reply_Image3.map((image, index) => (
                      <div key={index} className="image-preview bg-light p-2" style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(image)} width={50} alt={`Selected Image ${index + 1}`} />
                        <button style={{ position: 'absolute', top: '-10px', right: '-16px' }} className='btn btn-sm' onClick={() => removereply_Image3(index)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                        </svg></button>
                      </div>
                    ))
                  }
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Group_discussion_modals