# El pequeño universo de Missi

Un cuento de cumpleaños para recorrer con Sol. El proyecto se abre con un doble clic en `index.html` después de extraer el ZIP. Las ilustraciones, las tres melodías y los efectos están incluidos. También funciona dentro de una subcarpeta de GitHub Pages.

## Dale tu toque, Rob

Abre **`personalizar.js`** con un editor de texto. Allí están la carta, la foto de Sol y la lista de canciones. Guarda el archivo y recarga la página para probar los cambios.

### Tu carta

Escribe un párrafo por elemento de `parrafos`. Puedes cambiar el saludo y la firma. Si dejas la lista vacía, el sobre muestra un breve «¡Feliz cumpleaños!» con tu firma.

```js
carta: {
  saludo: "Missi,",
  parrafos: [
    "Aquí va mi primer párrafo.",
    "Aquí va mi segundo párrafo."
  ],
  firma: "Rob · Ryu"
},
```

Si quieres poner comillas dentro de tu carta, puedes usar las españolas «así».

### Una foto de Sol

Copia la foto a `assets/fotos/sol.jpg` y configura `fotoSol: "assets/fotos/sol.jpg"`. También puedes usar PNG o WebP indicando el nombre real con su extensión. Una foto cuadrada deja el rostro bien encuadrado en la insignia circular del guía. Mientras no agregues foto, Sol se presenta con un pequeño sol dibujado. El gato mensajero de la portada es un personaje del cuento.

### Tus canciones

Guarda los MP3 en `assets/musica/`. Para elegir tu propia lista, cambia `canciones` en el mismo archivo. El orden de las líneas es el orden de reproducción. Una lista vacía reproduce **Faroles de papel**, **Pasitos de Sol** y **Ventanas azules**, tres piezas instrumentales creadas para este regalo.

```js
canciones: [
  { titulo: "Mi primera canción", archivo: "assets/musica/primera.mp3" },
  { titulo: "Nuestra lista de hoy", archivo: "assets/musica/segunda.mp3" }
]
```

El botón dorado de la portada inicia el recorrido y la música. **Radio** permite reproducir, pausar, cambiar de pista, ajustar el volumen, desactivar los efectos o silenciarlo todo. La canción sigue sonando al cambiar de escena. En una pestaña recién abierta, también puedes encenderla desde la radio.

## Publicarlo en GitHub Pages

1. Extrae el ZIP. Sube el contenido de la carpeta extraída a la raíz de tu repositorio. En la primera pantalla del repo deben verse `index.html`, `personalizar.js` y la carpeta `assets` al mismo nivel. Incluye `.nojekyll` si subes los archivos usando Git.
2. En el repositorio abre **Settings → Pages**. En **Build and deployment**, elige **Deploy from a branch**. Selecciona la rama donde subiste los archivos (normalmente `main`), la carpeta **/ (root)** y **Save**.
3. Cuando GitHub muestre **Visit site**, abre esa dirección y prueba el botón dorado, la radio y la carta. Copia la dirección de la **portada** para enviársela por WhatsApp.
4. Para preparar la miniatura del mensaje, abre `index.html` y busca `property="og:image"`. Sustituye `./assets/arte/postal.jpg` por la dirección completa de tu sitio seguida de `/assets/arte/postal.jpg`. Haz este cambio antes de compartir el enlace por primera vez. WhatsApp decide cuándo cargar su vista previa.

[Instrucciones oficiales de GitHub Pages](https://docs.github.com/es/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Para volver otro día

El refugio tiene un michi al que acariciar, una caja que va cambiando de mensaje y una ventana con estrellas que responden al tocarlas. Los encargos, los secretos y las preferencias de sonido se guardan en el navegador que Missi utilice. Puede volver a jugar desde el refugio. La visita a Mash siempre se elige de forma expresa y queda fuera del recuento de logros.
