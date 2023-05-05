import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { Box, TextField, Button, Typography } from "@mui/material";
import { db } from "../../firebase/config";

const AddPackage = () => {
  const [packageName, setPackageName] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [macroMessage, setMacroMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "travelPackages"), {
        name: packageName,
        city,
        price: parseInt(price),
        description,
        macroMessage,
      });

      alert("패키지가 추가되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("Error adding package:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        mt: 3,
      }}
    >
      <Typography variant="h4">패키지 추가</Typography>

      <TextField
        id="packageName"
        label="패키지 이름"
        variant="outlined"
        value={packageName}
        onChange={(e) => setPackageName(e.target.value)}
        fullWidth
      />

      <TextField
        id="city"
        label="도시"
        variant="outlined"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        fullWidth
      />

      <TextField
        id="price"
        label="가격"
        variant="outlined"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        fullWidth
        type="number"
      />

      <TextField
        id="description"
        label="설명"
        variant="outlined"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={4}
      />

      <TextField
        id="macroMessage"
        label="매크로 메시지"
        variant="outlined"
        value={macroMessage}
        onChange={(e) => setMacroMessage(e.target.value)}
        fullWidth
        multiline
        rows={4}
      />

      <Button variant="contained" color="primary" type="submit">
        패키지 추가
      </Button>
    </Box>
  );
};

export default AddPackage;
