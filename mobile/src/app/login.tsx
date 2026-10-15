import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { parseApiError } from "@/api/errors";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { homeDelRol } from "@/constants/roles";
import { colors, radius, shadow } from "@/constants/theme";

export default function LoginScreen() {
  const { status, user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function ingresar() {
    const faltan: typeof errores = {};
    if (!email.trim()) faltan.email = "Ingresá tu email.";
    if (!password) faltan.password = "Ingresá tu contraseña.";
    setErrores(faltan);
    if (faltan.email || faltan.password) return;

    setMensaje(null);
    setCargando(true);
    try {
      // Si sale bien, el Redirect de más abajo lleva a la pantalla del rol.
      await signIn({ email: email.trim(), password });
    } catch (error) {
      setMensaje(parseApiError(error).message);
      setCargando(false);
    }
  }

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (user) {
    return <Redirect href={homeDelRol(user.rol)} />;
  }

  const encabezado = (
    <>
      <View style={styles.logo}>
        <Ionicons name="medkit" size={34} color={colors.brand} />
      </View>
      <Text style={styles.appName} accessibilityRole="header">
        SalaControl
      </Text>
      <View style={styles.bar} />
      <Text style={styles.subtitle}>Sala de Aislamiento</Text>
    </>
  );

  return (
    <Screen header={encabezado}>
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>

        <ErrorBanner message={mensaje} />

        <TextField
          label="Email"
          value={email}
          onChangeText={(texto) => {
            setEmail(texto);
            setErrores({ ...errores, email: undefined });
          }}
          error={errores.email}
          placeholder="nombre@hospital.gob.ar"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          editable={!cargando}
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={(texto) => {
            setPassword(texto);
            setErrores({ ...errores, password: undefined });
          }}
          error={errores.password}
          password
          autoCapitalize="none"
          autoComplete="password"
          returnKeyType="go"
          onSubmitEditing={ingresar}
          editable={!cargando}
        />

        <Button title="Ingresar" onPress={ingresar} loading={cargando} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.white,
  },
  bar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 6,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: colors.brandSoft,
  },
  card: {
    gap: 14,
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 20,
    ...shadow,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
  },
});
