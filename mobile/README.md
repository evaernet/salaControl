# SalaControl · App móvil

React Native con Expo SDK 57, Expo Router y TypeScript. Consume la API de Laravel con Axios.

```bash
npm install
npx expo start        # escaneá el QR con Expo Go (SDK 57)
npm run typecheck     # TypeScript
npx eslint .          # lint
```

La URL de la API se toma de `EXPO_PUBLIC_API_URL` (ver `.env.example`). Si no se define, se usa la IP de la
computadora que corre Expo en el puerto 8000.

Las instrucciones completas están en el `README.md` de la carpeta principal del proyecto.
