import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

/**
 * Rota GET para buscar agendamentos pendentes de uma unidade específica
  * Exemplo: /appointments/IFCO-CENTRAL
   */
   router.get("/:unit", async (req, res) => {
     const { unit } = req.params;

       try {
           const snapshot = await db
                 .collection("unidades")
                       .doc(unit)
                             .collection("appointments")
                                   .where("status", "==", "pendente")
                                         .get();

                                             const appointments = snapshot.docs.map((doc) => ({
                                                   id: doc.id,
                                                         ...doc.data(),
                                                             }));

                                                                 res.status(200).json({ success: true, appointments });
                                                                   } catch (error) {
                                                                       console.error("❌ Erro ao buscar agendamentos:", error);
                                                                           res.status(500).json({ success: false, message: "Erro ao buscar agendamentos", error: error.message });
                                                                             }
                                                                             });

                                                                             export default router;