import { useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function useAutoUpdateLocation() {
  useEffect(() => {
    const updateUserLocation = async () => {
      if (!auth.currentUser) return;
      if (!("geolocation" in navigator)) return;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            location: { latitude, longitude },
          });
          console.log("📍 Auto location updated:", latitude, longitude);
        },
        (error) => {
          console.warn("⚠️ Location update failed:", error.message);
        }
      );
    };

    updateUserLocation();
  }, []);
}
