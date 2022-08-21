import { React } from "react";
import { ToastContainer, toast } from 'react-toastify';
import {  useState, useEffect } from "react";
import 'react-toastify/dist/ReactToastify.css';
import styled from "styled-components";
import { fetchPicture } from "services/api";
import Searchbar from "./Searchbar/Searchbar"
import ImageGallery from "./ImageGallery/ImageGallery";
import Modal from './modal/modal';
import LoadMore from './Button/Button'
import Loader from "./Loader/loader";




const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

const App = () => {
  const [request, setRequest] = useState("");
  const [page, setPage] = useState(1);
  const [pictures, setPictures] = useState([]);
  const [showBtn, setShowBtn] = useState(false);
  const [largeImageURL, setLargeImageURL] = useState('');
  const [status, setStatus] = useState(Status.IDLE);

  useEffect(() => {
    
    if (!request) {
      return;
    }

    setStatus(Status.PENDING);
    
    const fetchData = async () => {
      const result = await fetchPicture(request, page);
      if (result.hits.length > 0 && result.hits.length < 12) {
        setShowBtn(false);
        setPictures(p => [...p, ...result.hits])
        toast.info(`That's all we found`)
        setStatus(Status.RESOLVED);
      } else if (result.total > 12) {
        setPictures(p => [...p, ...result.hits])
        setShowBtn(true);
        setStatus(Status.RESOLVED);
      }
      if (result.total === 0) {
        setPage(1);
        setShowBtn(false);
        toast.error(`Sorry, no results for ${request}`);
        setStatus(Status.IDLE);
      }
    }
    fetchData();
  }, [request, page]);


  const formSubmit = (text) => {
    setRequest(text);
    setPictures([]);
    setPage(1);
  };
  
  const btnLoad = () => {
    setPage(prevState => (prevState + 1))
  };
  
  const showLargePicture = (pictureId) => {
    setLargeImageURL(pictureId)
  };
 
  const closeModal = () => {
    setLargeImageURL('')
  };
   
  return (
    < MainContainer >
      <Searchbar onSubmit={formSubmit}></Searchbar>
      {status === 'idle' && <Message>Enter a request</Message>}
      {status === 'pending' && <Loader></Loader>}
      {status === 'resolved' &&
        <ImageGallery
          pictures={pictures}
          largeImg={showLargePicture}
        />}
      {largeImageURL.length > 0 && <Modal onClose={closeModal}><img src={largeImageURL} alt="Увеличенная картинка" /></Modal>}
      {showBtn && <LoadMore onLoad={btnLoad}></LoadMore>}
        
      <ToastContainer autoClose={2000} />
    </MainContainer>)
};
 

export default App;

const MainContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 16px;
  padding-bottom: 24px;
`;
const Message = styled.div`
    text-align: center;
    font-size: 40px;
    font-style: italic;
    font-weight: bold;
`;