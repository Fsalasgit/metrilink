// src/App.jsx
import { useState } from "react";
import { Box, Container, CssBaseline, Typography } from "@mui/material";
import "./App.css";

import { useMeasurements } from "./hooks/useMeasurements";
import { useBluetooth } from "./hooks/useBluetooth";
import { syncMeasurementsToSheet } from "./services/syncService";

import SplashPage from "./pages/SplashPage";
import ProjectsPage from "./pages/ProjectsPage";
import VanosPage from "./pages/VanosPage";
import VanoDetailPage from "./pages/VanoDetailPage";

import HeaderBar from "./components/layout/HeaderBar";
import TopIconRow from "./components/layout/TopIconRow";

function App() {
  const [screen, setScreen] = useState("splash");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    projects,
    selectedProject,
    setSelectedProject,
    vanos,
    selectedVano,
    setSelectedVano,
    selectedMeasurement,
    createProject,
    addVano,
    applyMeasurement,
    updateNote,
    clearAll,
  } = useMeasurements();

  // función llamada cuando el GLM devuelve una medición
  const handleNewMeasurement = (distance, meta) => {
    if (!meta || !meta.id || !meta.field) return;
    console.log("📏 handleNewMeasurement:", distance, meta);
    applyMeasurement(meta.id, meta.field, distance);
    // clearWaiting(); // limpiamos "esperando"
  };

  const {
    status,
    waitingForMeasurement,
    handleConnect,
    waitForField,
    clearWaiting,
  } = useBluetooth(handleNewMeasurement);

  // fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  
  const handleSync = async () => {
    try {
      await syncMeasurementsToSheet(vanos);
      alert("Datos enviados correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al enviar los datos");
    }
  };


  // Qué pantalla mostramos
  let content = null;

  if (screen === "splash") {
    content = <SplashPage onFinish={() => setScreen("projects")} />;
  } else if (screen === "projects") {
    content = (
      <ProjectsPage
        projects={projects}
        onSelect={(pr) => {
          setSelectedProject(pr);
          setScreen("vanos");
        }}
        onCreate={() => {
          const pr = prompt("Ingrese número de proyecto (PR-XXXXX):");
          if (pr) {
            createProject(pr);
            setScreen("vanos");
          }
        }}
      />
    );
  } else if (screen === "vanos") {
    content = (
      <VanosPage
        projectId={selectedProject}
        vanos={vanos}
        onBack={() => setScreen("projects")}
        onAdd={() => {
          const vano = prompt("Código de vano (V01):");
          if (vano) addVano(vano);
        }}
        onOpenVano={(vano) => {
          setSelectedVano(vano);
          setScreen("vanoDetail");
        }}
      />
    );
  } else if (screen === "vanoDetail" && selectedMeasurement) {
    content = (
      <VanoDetailPage
        projectId={selectedProject}
        measurement={selectedMeasurement}
        waitingForMeasurement={waitingForMeasurement}
        onBack={() => setScreen("vanos")}
        onEditField={(field) =>
          waitForField({
            id: selectedMeasurement.id,
            field,
            vano: selectedMeasurement.n_vano,
          })
        }
        onChangeNota={(nota) => updateNote(selectedMeasurement.id, nota)}

        onManualMeasure={(field, valueMm) => {
          applyMeasurement(selectedMeasurement.id, field, valueMm, "manual");
          clearWaiting();
        }}
      />
    );
  }

  return (
    <>
      <CssBaseline />
      <Box className="app-root">
        <Box className="phone-frame">
          {screen === "splash" ? (
            content
          ) : (
            <Container sx={{ py: 2 }}>
              <HeaderBar screen={screen} />
              <TopIconRow
                onConnect={handleConnect}
                onClear={clearAll}
                isFullscreen={isFullscreen}
                onFullscreen={toggleFullscreen}
                onSync={handleSync}
              />
              <Typography
                variant="subtitle2"
                align="center"
                sx={{ my: 1, fontWeight: 600 }}
              >
                {status}
              </Typography>
              {content}
            </Container>
          )}
        </Box>
      </Box>
    </>
  );
}

export default App;
