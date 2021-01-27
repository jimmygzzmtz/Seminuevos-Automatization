import './App.css';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

import {
  Box,
  Button,
  FormHelperText,
  TextField,
  CircularProgress
} from '@material-ui/core';

// Manages the forms needed to input the price and description
function InputData(props) {

  // Used to keep track of given price and description
  var price = props.price;
  var description = props.description;

  // Manage width styles for both text fields
  const useStyles = makeStyles((theme) => ({
    single: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '50%',
      },
    },
    multi: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '100%',
      },
    },
  }));

  const classes = useStyles();

  // Check if inputs are appropriate, if so, switch to loading state
  function postAd() {
    if(description == "" || description.length > 5000 || price == "" || price.match(/[^$,.\d]/)){
      alert("Se tienen que llenar ambos campos con datos correctos.");
    }
    else{
      props.changeLoading(true);
    }
  }

  const isLoading = props.isLoading;
  const showImage = props.showImage;

  // If not loading and an image has not been generated, render the inputs
  if (!isLoading && showImage == null) {
    return <>
    <Box padding={4}>
        <form id="price" noValidate autoComplete="off" className={classes.single}>
          <TextField
            onChange={props.changePrice}
            label="Precio"
            placeholder="Precio del carro"
            variant="outlined"
          />
        </form>
      </Box>
      <Box padding={4}>
        <form id="description" noValidate autoComplete="off" className={classes.multi}>
          <TextField
            onChange={props.changeDescription}
            label="Descripcion"
            placeholder="Descripción del carro"
            multiline
            variant="outlined"
          />
          <FormHelperText>{description.length}/5000.</FormHelperText>
        </form>
      </Box>
      <Box padding={4}>
        <Button variant="contained" color="primary" onClick={postAd}>Publicar</Button>
      </Box>
    </>;
  }
  // If not, render nothing
  else{
    return <></>
  }
}

// Manages the loading animation, if needed
function LoadingTemp(props){
  if(props.isLoading){
    return <>
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
      <CircularProgress></CircularProgress>
    </div>
    </>
  }
  else{
    return <></>
  }
}

// Manages the main app functions
function App() {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImage, setImage] = useState(null);

  const changePrice = (event) => {
    setPrice(event.target.value);
  };

  // Changes the description, with a limit of 5000 characters due to site specs
  const changeDescription = (event) => {
    if (event.target.value.length >= 5000) {
      event.target.value = event.target.value.slice(0, 4999)
    }
    setDescription(event.target.value);
  };

  // Send data to puppeteer server
  const changeLoading = (event) => {
    setLoading(event);
    if(event == true){
      const sendData = {
            price: price,
            description: description
      }
      axios.post('http://localhost:4000/postAd', sendData)
        .then(res => changeImage(res.data.message));
    }
  };

  // Change image data to base64 that was received, switch off loading state
  const changeImage = (imgData) => {
    setImage(imgData);
    setLoading(false);
  };

  return (
    <>
      <Box padding={6} color="white" bgcolor="blue">
        <h1>Seminuevos-Automatization</h1>
      </Box>
      <InputData showImage={showImage} isLoading={loading} changeLoading={changeLoading} price={price} changePrice={changePrice} description={description} changeDescription={changeDescription}/>
      <LoadingTemp isLoading={loading}></LoadingTemp>
      {showImage && (<img src={"data:image/png;base64, " + showImage}></img>)}
    </>
  );
}
export default App;
