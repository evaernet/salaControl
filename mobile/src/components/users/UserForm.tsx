import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { parseApiError } from "@/api/errors";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { TextField } from "@/components/ui/TextField";
import { colors, radius } from "@/constants/theme";
import type { Rol } from "@/types/user";

import { RolePicker } from "./RolePicker";

export interface UserFormValues {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: Rol;
  activo: boolean;
}

interface UserFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<UserFormValues>;
  submitLabel: string;
  // Si la API falla tiene que lanzar el error: el formulario se encarga de mostrarlo.
  onSubmit: (values: UserFormValues) => Promise<void>;
  // El administrador editándose a sí mismo no puede cambiar su rol ni desactivarse.
  esUsuarioActual?: boolean;
}

type Errores = Partial<Record<keyof UserFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(values: UserFormValues, mode: UserFormProps["mode"]): Errores {
  const errores: Errores = {};
  if (!values.nombre.trim()) errores.nombre = "Ingresá el nombre.";
  if (!values.apellido.trim()) errores.apellido = "Ingresá el apellido.";
  if (!values.email.trim()) errores.email = "Ingresá el email.";
  else if (!EMAIL_RE.test(values.email.trim()))
    errores.email = "El email no es válido.";
  if (mode === "create" && !values.password)
    errores.password = "Ingresá una contraseña.";
  else if (values.password && values.password.length < 8) {
    errores.password = "La contraseña debe tener al menos 8 caracteres.";
  }
  return errores;
}

export function UserForm({
  mode,
  initialValues,
  submitLabel,
  onSubmit,
  esUsuarioActual = false,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "medico",
    activo: true,
    ...initialValues,
  });
  const [errores, setErrores] = useState<Errores>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function set<K extends keyof UserFormValues>(
    campo: K,
    valor: UserFormValues[K],
  ) {
    setValues((v) => ({ ...v, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function handleSubmit() {
    const locales = validar(values, mode);
    setErrores(locales);
    if (Object.keys(locales).length > 0) {
      setMensaje("Revisá los datos marcados.");
      return;
    }

    setMensaje(null);
    setGuardando(true);
    try {
      await onSubmit({ ...values, email: values.email.trim() });
    } catch (error) {
      const apiError = parseApiError(error);
      const hayErroresDeCampo = Object.keys(apiError.fieldErrors).length > 0;
      setErrores(apiError.fieldErrors as Errores);
      // Los errores de un campo van debajo del campo; arriba queda un aviso general.
      setMensaje(
        hayErroresDeCampo ? "Revisá los datos marcados." : apiError.message,
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={styles.form}>
      <ErrorBanner message={mensaje} />

      <TextField
        label="Nombre"
        value={values.nombre}
        onChangeText={(t) => set("nombre", t)}
        error={errores.nombre}
        autoCapitalize="words"
        textContentType="givenName"
      />
      <TextField
        label="Apellido"
        value={values.apellido}
        onChangeText={(t) => set("apellido", t)}
        error={errores.apellido}
        autoCapitalize="words"
        textContentType="familyName"
      />
      <TextField
        label="Email"
        value={values.email}
        onChangeText={(t) => set("email", t)}
        error={errores.email}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="@hospital.gob.ar"
      />
      <TextField
        label={mode === "create" ? "Contraseña" : "Nueva contraseña"}
        value={values.password}
        onChangeText={(t) => set("password", t)}
        error={errores.password}
        hint={
          mode === "create"
            ? "Mínimo 8 caracteres."
            : "Dejala vacía para mantener la actual."
        }
        password
        autoCapitalize="none"
        textContentType="newPassword"
      />

      <RolePicker
        value={values.rol}
        onChange={(rol) => set("rol", rol)}
        disabled={esUsuarioActual}
        error={errores.rol}
      />

      {mode === "edit" ? (
        <View style={styles.switchRow}>
          <View style={styles.switchTexts}>
            <Text style={styles.switchTitle}>Usuario activo</Text>
            <Text style={styles.switchHint}>
              {values.activo
                ? "Puede iniciar sesión."
                : "No puede iniciar sesión."}
            </Text>
            {errores.activo ? (
              <Text style={styles.error}>{errores.activo}</Text>
            ) : null}
          </View>
          <Switch
            accessibilityLabel="Usuario activo"
            value={values.activo}
            onValueChange={(v) => set("activo", v)}
            disabled={esUsuarioActual}
            trackColor={{ true: colors.brand, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      ) : null}

      {esUsuarioActual ? (
        <Text style={styles.selfNote}>
          Es tu usuario: no podés cambiar tu rol ni desactivarte.
        </Text>
      ) : null}

      <Button title={submitLabel} onPress={handleSubmit} loading={guardando} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius,
    padding: 14,
  },
  switchTexts: {
    flex: 1,
    gap: 2,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  switchHint: {
    fontSize: 13,
    color: colors.muted,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
  },
  selfNote: {
    fontSize: 13,
    color: colors.muted,
  },
});
