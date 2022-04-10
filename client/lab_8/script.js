function getRandomIntInclusive(min, max) {
    const newMin = Math.ceil(min);
    const newMax = Math.floor(max);
    return Math.floor(
      Math.random() * (newMax - newMin + 1) + newMin
    );
  }
  
  function restoArrayMake(dataArray){
    //console.log('fired datahandler');
    //console.table(dataArray); // this is called "dot notation"
    const range = [...Array(15).keys()];
    const listItems = range.map((item, index) => {
      const restNum = getRandomIntInclusive(0, dataArray.length - 1);
      return dataArray[restNum];
    });
  
    console.log(listItems);
    return listItems;
    //range.forEach((item) => {
    //console.log('range item', item);
    // });
  }
    
  function createHtmlList(collection) {
    //console.log(collection);
    const targetList = document.querySelector('.resto-list');
    targetList.innerHTML = "";
    collection.forEach((item) => {
      const {name} = item;
      const displayName = name.toLowerCase();
      const injectThisItem = `<li>${item.name}</li>`;
      targetList.innerHTML += injectThisItem;
    });
  }
  
  function createHtmlListZip(collection) {
    //console.log(collection);
    const targetList = document.querySelector('.resto-list');
    targetList.innerHTML = "";
    collection.forEach((item) => {
      const {zip} = item;
      const displayName = zip.toLowerCase();
      const injectThisItem = `<li>${item.name}</li>`;
      targetList.innerHTML += injectThisItem;
    });
  }
  
  function initMap (targetId) {
    const latLong = [38.7849, -76.8721];
    const map = L.map(targetId).setView(latLong, 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
}).addTo(map);
return map;
  }

  function addMapMarkers (map, collection) {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        console.log(layer);
        layer.remove();
      }
    });
    
    collection.forEach((item) => {
    const point = item.geocoded_column_1?.coordinates;
    console.log(item.geocoded_column_1?.coordinates);
    L.marker([point[1], point[0]]).addTo(map);
    });
  }

  async function mainEvent() { // the async keyword means we can make API requests
    const form = document.querySelector('.box');
    const submit = document.querySelector('.submit_button');
    
    const resto = document.querySelector('#resto_name');
    const zipcode = document.querySelector('#zipcode');
    const map = initMap('map');
    const retrievalVar = 'res=taurants';
    submit.style.display = 'none';
  
   // if (localStorage.getItem(retrievalVar) === undefined) {
    const results = await fetch('/api/foodServicesPG'); // This accesses some data from our API
    const arrayFromJson = await results.json(); // This changes it into data we can use - an object
    console.log(arrayFromJson);
    localStorage.setItem(retrievalVar, JSON.stringify(arrayFromJson.data));
  //}

    const storedDataString = localStorage.getItem(retrievalVar);
    const storedDataArray = JSON.parse(storedDataString);
    console.log(storedDataArray);
   
  
    // this if statement is to prevent a race condition on data load
    if (storedDataArray.length > 0) {
      submit.style.display = 'block';
    
  
      let currentArray = [];
      resto.addEventListener('input', async (event) => {
        console.log(event.target.value);
        
        if (currentArray.length < 1) {
          return;
        }
        
        const selectResto = storedDataArray.filter((item) => {
          const lowerName = item.name.toLowerCase();
          const lowerValue = event.target.value.toLowerCase();
          return lowerName.includes(lowerValue);
        });
  
        createHtmlList(selectResto);
  
      });
  
      zipcode.addEventListener('input', async (event) => {
        console.log(event.target.value);
        
        if (currentArray.length < 1) {
          return;
        }
        
        const selectZip = currentArray.filter((item) => {
          const lowerName = item.zip.toLowerCase();
          const lowerValue = event.target.value.toLowerCase();
          return lowerName.includes(lowerValue);
        });
  
        createHtmlListZip(selectZip);
  
      });
  
      form.addEventListener('submit', async (submitEvent) => { // async has to be declared all the way to get an await
        submitEvent.preventDefault(); // This prevents your page from refreshing!
        //console.log('form submission'); // this is substituting for a "breakpoint"
        // arrayFromJson.data - we're accessing a key called 'data' on the returned object
        // it contains all 1,000 records we need
        currentArray = restoArrayMake(storedDataArray);
        createHtmlList(currentArray);
        addMapMarkers(map, currentArray);
        createHtmlListZip(currentArray);
      });
    }
  }

    
  // this actually runs first! It's calling the function above
  document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests