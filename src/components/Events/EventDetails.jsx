import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleteing,setIsDeleting] = useState(false);
  
  const params= useParams();
  const id =params.id
  const navigate = useNavigate();

  const {data, isPending,isError,error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({signal,id}),
  });

  const {
    mutate, 
    isPending: isPendingDeletion, 
    isError: isErrorDeteing,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      })
      navigate('/events');
    }
  });


  function handleStarteDelete() {
    setIsDeleting(true);
  }

  function handleStopeDelete() {
    setIsDeleting(false);
  }

  function deleteEventHandler() {
    mutate({id:id})
  }

  let content;
  if(isPending) {
    content = <div id='event-details-content' className='center'>
      <p>Fetching event data...</p>
    </div>
  }
  
  if(isError) {
    content = <div id='event-details-content' className='center'>
      <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to fetch data,Please try again later'}/>
    </div>
  }

  if(data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStarteDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`https://events-backend-1-nb2z.onrender.com/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isDeleteing && (
        <Modal onClose={handleStopeDelete}>
          <h2>Are oyu Sure?</h2>
          <p>Do you really want to delete this event? This action cannot be undone.</p>
          <div className='form-actions'>
            {isPendingDeletion && <p>Feleting, please wait...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleStopeDelete} className='button-text'>Cancel</button>
                <button onClick={deleteEventHandler} className='button'>Delete</button>
              </>
              )}
            </div>
            {isErrorDeteing && <ErrorBlock title="Failed to delete event" message={deleteError.info?.message || 'Failed to delete event'} />}
        </Modal>
      )}
      <Outlet />
        <Header>
          <Link to="/events" className="nav-item">
            View all Events
          </Link>
        </Header>
        <article id="event-details">
          {content}
        </article>
    </>
  );
}
