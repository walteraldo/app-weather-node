import dotenv from "dotenv";
dotenv.config({ path: "./tokens.env" });

import {
  inquirerMenu,
  leerInput,
  listarLugares,
  pausa,
} from "./helpers/inquirer.js";
import { Busquedas } from "./models/busquedas.js";

// console.log(process.env.MAPBOX_KEY);

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();
    switch (opt) {
      case 1:
        // mostrar mensaje
        const termino = await leerInput("Ciudad: ");
        // buscar lugares
        const lugares = await busquedas.ciudad(termino);
        // seleccionar el lugar
        const id = await listarLugares(lugares);
        if(id === '0') continue;
        // buscar los lugares
        const lugarSel = lugares.find(lugar => lugar.id === id);
        //guardar en db
        busquedas.agregarHistorial(lugarSel.nombre);
        // console.log(lugarSel);
        // datos del clima
        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
        // console.log(clima);
        // mostrar resultados
        console.clear();
        console.log("\nInformación de la ciudad\n".red);
        console.log("Ciudad:", lugarSel.nombre.green);
        console.log("Lat:", lugarSel.lat);
        console.log("Lng:", lugarSel.lng);
        console.log("Temperatura:", clima.temp);
        console.log("Mínima:", clima.min);
        console.log("Máxima:", clima.max);
        console.log("Como está el clima:", clima.desc.green);

        break;
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i+1}.`.green;
          console.log(`${idx} ${lugar}`);
        })
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
