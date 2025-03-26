const urlToBlob = async (url:string) => {
    try {
      // Directly fetch the image from the URL
      const response = await fetch(url);
  
      // Convert the image to a Blob
      const blob = await response.blob();
  
      return blob;
    } catch (error) {
      console.error('Error converting URL to Blob:', error);
      throw error;
    }
  };

  export default urlToBlob