import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

router.get("/:unit", async (req, res) => {
  const { unit } = req.params;

  try {
    const snapshot = await db
      .collection("unidades")
      .doc(unit)
      .collection("appointments")
      .where("status", "in", ["em andamento","pendente"])
      .get();

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao buscar agendamentos",
        error: error.message,
      });
  }
});

router.post("/updateStatus", async (req, res) => {
  const {unit, id, status } = req.body;

  if (!unit || !id || !status){
    return res.status(400).json({ success: false, message: "Dados incompletos" });
  }
  try {
    const docRef = db.collection("unidades").doc(unit).collection("appointments").doc(id);
    await docRef.update({ status });

    res.json({ success: true, message: "Status atualizado com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao atualizar status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
})

router.post("/:unit/create", async (req, res) => {
  const { unit } = req.params;
  const data = req.body;

  try {
    const docRef = await db
      .collection("unidades")
      .doc(unit)
      .collection("appointments")
      .add({
        ...data,
        status: "pendente",
        createdAt: new Date(),
      });

    const usersSnapshot = await db
      .collection("unidades")
      .doc(unit)
      .collection("users")
      .where("role", "==", "higienizador")
      .get();

    const tokens = usersSnapshot.docs
      .map((doc) => doc.data().pushToken)
      .filter((t) => !!t);

    if (tokens.length > 0) {
      await fcm.sendEachForMulticast({
        tokens,
        notification: {
          title: "Novo agendamento disponível",
          body: `Um novo agendamento foi criado na unidade ${unit}.`,
        },
        data: {
          action: "NEW_APPOINTMENT",
          unit,
        },
      });
    }

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: "Agendamento criado e notificação enviada",
    });
  } catch (error) {
    console.error("❌ Erro ao criar agendamento:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
