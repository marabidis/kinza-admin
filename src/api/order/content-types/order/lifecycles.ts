import axios from 'axios'

export default {
    afterCreate({ result }) {
      axios.post(`http://n8n:5678/webhook/${process.env.N8N_WEBHOOK_ID}`, result).catch((error) => {

        console.error(error);
      })
    },
  };