import axios from 'axios'

export default {
    afterCreate({ result }) {
      axios.post('http://n8n:5678/webhook/5896e17a-8bc7-4f72-9e4c-81a982d855e2', result).catch((error) => {

        console.error(error);
      })
    },
  };