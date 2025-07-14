import React, { useState, useRef } from "react";
import axios from "axios";
import { marked } from "marked";
import {
  Box,
  Modal,
  Typography,
  Button,
  IconButton,
  TextField,
  FormHelperText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function App() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({ file: "", jobDesc: "" });
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = { file: "", jobDesc: "" };
    let hasError = false;

    // if (!file) {
    //   newErrors.file = 'Please upload a PDF resume.';
    //   hasError = true;
    // }

    if (!jobDesc.trim()) {
      newErrors.jobDesc = "Job description is required.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDesc);

    setLoading(true);
    try {
      const res = await axios.post(
        "https://resume-reviewer-woad.vercel.app/api/review",
        formData
      );
      setAnalysis(marked(res.data.analysis));
      setOpen(true);
      setErrors({ file: "", jobDesc: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setJobDesc("");
    setAnalysis("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // this clears the file input
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          bgcolor: "#fff",
          p: 4,
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Resume Evaluator AI
        </Typography>

        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: 4 }}
          />
          {errors.file && (
            <FormHelperText error sx={{ mb: 2 }}>
              {errors.file}
            </FormHelperText>
          )}

          <TextField
            label="Paste Job Description"
            multiline
            rows={5}
            fullWidth
            margin="normal"
            error={Boolean(errors.jobDesc)}
            helperText={errors.jobDesc}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </form>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 800,
            maxHeight: "90vh",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 6,
            overflowY: "auto",
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" gutterBottom>
            Resume Analysis Result
          </Typography>

          <Box
            dangerouslySetInnerHTML={{ __html: analysis }}
            sx={{
              fontFamily: "Roboto, sans-serif",
              fontSize: "16px",
              color: "#333",
              lineHeight: 1.6,
              "& h3": {
                fontSize: "18px",
                fontWeight: 600,
                marginTop: "20px",
                marginBottom: "8px",
              },
              "& ul": {
                paddingLeft: "1.5rem",
                marginBottom: "1rem",
              },
              "& li": {
                marginBottom: "0.5rem",
              },
              "& p": {
                marginBottom: "1rem",
              },
              "& strong": {
                fontWeight: 600,
              },
              "& br": {
                display: "block",
                content: '""',
                marginBottom: "8px",
              },
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default App;
