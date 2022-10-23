import fs from 'fs';
import axios from 'axios';


class Busquedas {
  
  historial = [];
  dbPath = './db/database.json';
  
  constructor(){
    // leer DB si existe
    this.leerDb();
  }

  get historialCapitalizado(){
    // capitalizar cada palabra
    return this.historial.map(lugar => {
      // separo cada palabra en elementos del arreglo separado por un espacio => split
      // mapeo y devuelvo la primera letra capitalizada y concateno el resto => map
      // los vuelvo a unir mediante un espacio

      let palabras = lugar.split(' ');
      palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
      return palabras.join(' ');
        
    });
  }

  get paramsMapbox(){
    return {
      access_token: process.env.MAPBOX_KEY || '',
      language: 'es',
      limit: 5
    }
  }

  get paramsWeather(){
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es'
    }
  }

  async ciudad( lugar = '') {
    try {
    //peticion http
    const instance = axios.create({
      baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
      params: this.paramsMapbox,
    });

    const resp = await instance.get();
    // console.log(resp.data.features);
    return resp.data.features.map(lugar => ({
      id: lugar.id,
      nombre: lugar.place_name,
      lng: lugar.center[0],
      lat: lugar.center[1]
    }));

    return []; // retornar los lugares que coincidan con lo que escribio el usuario
    } catch (error) {

      return [];
    }
  }

  async climaLugar(lat, lon){
    try {

      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: {...this.paramsWeather, lat, lon}
      });
     
      const resp = await instance.get();
      // console.log(resp.data);
      const {weather, main} = resp.data;
      
      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp
      }
    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial (lugar = '') {
    // prevenir duplicados
    if(this.historial.includes(lugar.toLocaleLowerCase())){
      return;
    }
    this.historial = this.historial.splice(0, 5);
    this.historial.unshift(lugar.toLocaleLowerCase());
    // grabar en una DB
    this.guardarDb();
  }

  guardarDb(){
    const payload = {
      historial: this.historial
    }
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDb(){
    // debe existir
    if(!fs.existsSync(this.dbPath)) return;
    
    const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
    const data = JSON.parse(info); // de string a objeto JSON

    this.historial = data.historial;
  }


}

export { Busquedas };


// desde Mapbox
// https://api.mapbox.com/geocoding/v5/mapbox.places/Madrid.json?
    // language=es &access_token=pk.eyJ1IjoidGVyYWxkbyIsImEiOiJjbDlqOWIxMnkwN2VpM25wYjRoeG1mazF3In0.6yAOhIEbNQ72T1dVyQ8Bbw