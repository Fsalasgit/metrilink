// src/App.jsx
import { useState } from "react";
import {
  Box,
  Container,
  CssBaseline,
  Typography,
} from "@mui/material";
import "./App.css";

import { useMeasurements } from "./hooks/useMeasurements";
import { useBluetooth } from "./hooks/useBluetooth";
import { useVanoPhotoUpload } from "./hooks/useVanoPhotoUpload";

import {
  loadProjectSyncStatuses,
  saveProjectSyncStatus,
  clearProjectSyncStatuses,
} from "./services/storageService";

import {
  syncMeasurementsToSheet,
} from "./services/syncService";

import {
  deletePhotoFromDrive,
} from "./services/photoDeleteService";

import SplashPage from "./pages/SplashPage";
import ProjectsPage from "./pages/ProjectsPage";
import VanosPage from "./pages/VanosPage";
import VanoDetailPage from "./pages/VanoDetailPage";

import HeaderBar from "./components/layout/HeaderBar";
import TopIconRow from "./components/layout/TopIconRow";

function App() {
  const [screen, setScreen] =
    useState("splash");

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [
    projectSyncStatuses,
    setProjectSyncStatuses,
  ] = useState(() =>
    loadProjectSyncStatuses()
  );

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
    updateField,
    addPhotoToMeasurement,
    removePhotoFromMeasurement,
    clearAll,
  } = useMeasurements();

  /**
   * Marca el proyecto actual como pendiente.
   *
   * Se ejecuta cuando el usuario modifica alguna información
   * después de haber sincronizado.
   */
  const markCurrentProjectPending = () => {
    if (!selectedProject) {
      return;
    }

    const updatedStatuses =
      saveProjectSyncStatus(
        selectedProject,
        "pending"
      );

    setProjectSyncStatuses(
      updatedStatuses
    );
  };

  /**
   * Intercepta el guardado de una foto para marcar
   * el proyecto como pendiente.
   */
  const handleAddPhotoToMeasurement = (
    ...args
  ) => {
    const result =
      addPhotoToMeasurement(...args);

    markCurrentProjectPending();

    return result;
  };

  const {
    uploadingPhoto,
    photoMessage,
    photoError,
    handleCapturePhoto,
  } = useVanoPhotoUpload({
    selectedProject,
    selectedMeasurement,
    addPhotoToMeasurement:
      handleAddPhotoToMeasurement,
  });

  const handleDeletePhoto = async (
    photo
  ) => {
    const fileId = photo?.fileId;

    if (!selectedMeasurement?.id) {
      throw new Error(
        "No hay un vano seleccionado."
      );
    }

    if (!fileId) {
      throw new Error(
        "La foto no tiene fileId."
      );
    }

    await deletePhotoFromDrive(fileId);

    removePhotoFromMeasurement(
      selectedMeasurement.id,
      fileId
    );

    markCurrentProjectPending();
  };

  /**
   * Función llamada cuando el GLM devuelve una medición.
   */
  const handleNewMeasurement = (
    distance,
    meta
  ) => {
    if (
      !meta ||
      !meta.id ||
      !meta.field
    ) {
      return;
    }

    console.log(
      "📏 handleNewMeasurement:",
      distance,
      meta
    );

    applyMeasurement(
      meta.id,
      meta.field,
      distance
    );

    markCurrentProjectPending();
    clearWaiting();
  };

  const {
    status,
    waitingForMeasurement,
    handleConnect,
    waitForField,
    clearWaiting,
  } = useBluetooth(
    handleNewMeasurement
  );

  const toggleFullscreen = () => {
    if (
      !document.fullscreenElement
    ) {
      document.documentElement
        .requestFullscreen();

      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /**
   * Envía solamente los vanos del proyecto seleccionado.
   *
   * El estado se cambia a "sent" únicamente cuando
   * Apps Script responde con ok: true.
   */
  const handleSync = async () => {
    if (!selectedProject) {
      alert(
        "No hay un proyecto seleccionado."
      );
      return;
    }

    if (!vanos.length) {
      alert(
        "El proyecto no tiene vanos para enviar."
      );
      return;
    }

    try {
      await syncMeasurementsToSheet(
        vanos
      );

      const updatedStatuses =
        saveProjectSyncStatus(
          selectedProject,
          "sent"
        );

      setProjectSyncStatuses(
        updatedStatuses
      );

      alert(
        "Proyecto enviado correctamente a Google Sheets."
      );
    } catch (error) {
      console.error(
        "Error al sincronizar:",
        error
      );

      alert(
        error?.message ||
          "No se pudo enviar el proyecto a Google Sheets."
      );
    }
  };

  /**
   * Limpia mediciones y estados guardados.
   */
  const handleClearAll = () => {
    let continuar = true;

    while (continuar) {
      const numeroAleatorio =
        Math.floor(Math.random() * 9) + 1;

      const respuesta = window.prompt(
        `Para confirmar la eliminación, escriba el número que aparece en pantalla:\n\n${numeroAleatorio}`
      );

      // Si presiona Cancelar, no elimina nada.
      if (respuesta === null) {
        return;
      }

      const numeroIngresado =
        Number(respuesta.trim());

      // Si coincide, permite eliminar.
      if (numeroIngresado === numeroAleatorio) {
        clearAll();
        clearProjectSyncStatuses();
        setProjectSyncStatuses({});

        window.alert(
          "Los proyectos y mediciones fueron eliminados correctamente."
        );

        continuar = false;
      } else {
        window.alert(
          "El número ingresado es incorrecto. Se generará un nuevo número."
        );
      }
    }
  };

  let content = null;

  if (screen === "splash") {
    content = (
      <SplashPage
        onFinish={() =>
          setScreen("projects")
        }
      />
    );
  } else if (
    screen === "projects"
  ) {
    content = (
      <ProjectsPage
        projects={projects}
        syncStatuses={
          projectSyncStatuses
        }
        onSelect={(projectId) => {
          setSelectedProject(
            projectId
          );

          setScreen("vanos");
        }}
        onCreate={() => {
          const projectId = prompt(
            "Ingrese número de proyecto (PR-XXXXX):"
          );

          if (projectId) {
            createProject(projectId);
            setScreen("vanos");
          }
        }}
      />
    );
  } else if (
    screen === "vanos"
  ) {
    content = (
      <VanosPage
        projectId={
          selectedProject
        }
        vanos={vanos}
        onBack={() =>
          setScreen("projects")
        }
        onAdd={() => {
          const vano = prompt(
            "Código de vano (V01):"
          );

          if (vano) {
            addVano(vano);
            markCurrentProjectPending();
          }
        }}
        onOpenVano={(vano) => {
          setSelectedVano(vano);
          setScreen("vanoDetail");
        }}
      />
    );
  } else if (
    screen === "vanoDetail" &&
    selectedMeasurement
  ) {
    content = (
      <VanoDetailPage
        projectId={
          selectedProject
        }
        measurement={
          selectedMeasurement
        }
        waitingForMeasurement={
          waitingForMeasurement
        }
        onBack={() =>
          setScreen("vanos")
        }
        onEditField={(field) =>
          waitForField({
            id: selectedMeasurement.id,
            field,
            vano:
              selectedMeasurement.n_vano,
          })
        }
        onChangeNota={(nota) => {
          updateNote(
            selectedMeasurement.id,
            nota
          );

          markCurrentProjectPending();
        }}
        onChangeRevoque={(value) => {
          updateField(
            selectedMeasurement.id,
            "revoque",
            value
          );

          markCurrentProjectPending();
        }}
        onChangeTapajunta={(value) => {
          updateField(
            selectedMeasurement.id,
            "tapajunta",
            value
          );

          markCurrentProjectPending();
        }}
        onChangeApertura={(value) => {
          updateField(
            selectedMeasurement.id,
            "apertura",
            value
          );

          markCurrentProjectPending();
        }}
        onChangeEmbutida={(value) => {
          updateField(
            selectedMeasurement.id,
            "embutida",
            value
          );

          markCurrentProjectPending();
        }}
        onChangeRevestimiento={(value) => {
          updateField(
            selectedMeasurement.id,
            "revestimiento",
            value
          );

          markCurrentProjectPending();
        }}
        onChangeNpt={(value) => {
          updateField(
            selectedMeasurement.id,
            "npt",
            value
          );

          markCurrentProjectPending();
        }}
        onManualMeasure={(
          field,
          valueMm
        ) => {
          applyMeasurement(
            selectedMeasurement.id,
            field,
            valueMm,
            "manual"
          );

          markCurrentProjectPending();
          clearWaiting();
        }}
        onCapturePhoto={
          handleCapturePhoto
        }
        uploadingPhoto={
          uploadingPhoto
        }
        photoMessage={
          photoMessage
        }
        photoError={photoError}
        onDeletePhoto={
          handleDeletePhoto
        }
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
              <HeaderBar
                screen={screen}
              />

              <TopIconRow
                onConnect={
                  handleConnect
                }
                onClear={
                  handleClearAll
                }
                isFullscreen={
                  isFullscreen
                }
                onFullscreen={
                  toggleFullscreen
                }
                onSync={
                  screen === "vanos"
                    ? handleSync
                    : null
                }
              />

              <Typography
                variant="subtitle2"
                align="center"
                sx={{
                  my: 1,
                  fontWeight: 600,
                }}
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
