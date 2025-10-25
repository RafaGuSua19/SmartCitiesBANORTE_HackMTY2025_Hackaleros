// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // Cuando la app arranca, redirige directamente al login
  return <Redirect href="/login" />;
}
