import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ca: {
    translation: {
      // Navbar & General
      "dashboard": "Dashboard",
      "projects": "Projectes",
      "logged_in_as": "Connectat com:",
      "logout": "Tancar Sessió",

      // Dashboard Page
      "error_delete_project": "No s'ha pogut esborrar el projecte.",
      "pending_invitations": "Invitacions Pendents",
      "invites_you_to": "et convida a",
      "accept": "Acceptar",
      "decline": "Rebutjar",
      "my_projects": "Els meus Projectes",
      "new_project_button": "+ Nou Projecte",

      // Project Board - Accions i Modals
      "error_start_sprint": "No s'ha pogut iniciar l'sprint.",
      "confirm_delete_sprint": "Segur que vols esborrar aquest Sprint? Les tasques que contingui tornaran al Backlog.",
      "error_delete_sprint": "No s'ha pogut esborrar l'sprint.",
      "confirm_complete_sprint": "Segur que vols completar aquest Sprint? Les tasques no esborrades es quedaran on estan.",
      "success_complete_sprint": "Sprint completat amb èxit! 🎉",
      "error_move_task": "No pots moure aquesta tasca. Revisa les dependències.",
      "invite_button": "Convidar",
      "new_task_button": "+ Nova Tasca",
      
      // Project Board - Pestanyes
      "tab_backlog": "Backlog & Planificació",
      "tab_board": "Tablero Actiu",
      "tab_stats": "Estadístiques",
      
      // Project Board - Backlog
      "planned_sprints": "Sprints Planificats",
      "new_sprint_button": "+ Nou Sprint",
      "start_sprint_button": "Iniciar Sprint",
      "delete_sprint_tooltip": "Esborrar Sprint",
      "drag_tasks_here": "Arrossega tasques aquí per planificar-les",
      "unassigned_tasks": "Tasques sense assignar (Backlog)",
      "empty_backlog": "No hi ha tasques al Backlog.",
      
      // Project Board - Tauler
      "active_sprint": "Sprint Actiu:",
      "complete_sprint_button": "✅ Completar Sprint",
      "no_active_sprint": "No hi ha cap Sprint actiu actualment. Pots iniciar-ne un des de la pestanya Backlog.",
      
      // Project Board - Filtres
      "filters_label": "Filtres:",
      "filter_type": "Tipus",
      "filter_all": "Tots",
      "filter_assignee": "Assignat a",
      "filter_everyone": "Tothom",
      "clear_filters": "Netejar",
      
      // Project Board - Columnes (Kanban)
      "column_backlog": "Backlog 💡",
      "column_ready": "Ready 🔥",
      "column_in_progress": "In Progress 🚀",
      "column_in_review": "In Review 👀",
      "column_done": "Done ✅",
      
      // Project Board - Etiquetes
      "type_task": "Tasca",
      "type_feature": "Feature",
      "type_bug": "Bug"
    }
  },
  es: {
    translation: {
      // Navbar & General
      "dashboard": "Panel de Control",
      "projects": "Proyectos",
      "logged_in_as": "Conectado como:",
      "logout": "Cerrar Sesión",

      // Dashboard Page
      "error_delete_project": "No se ha podido borrar el proyecto.",
      "pending_invitations": "Invitaciones Pendientes",
      "invites_you_to": "te invita a",
      "accept": "Aceptar",
      "decline": "Rechazar",
      "my_projects": "Mis Proyectos",
      "new_project_button": "+ Nuevo Proyecto",

      // Project Board - Acciones y Modales
      "error_start_sprint": "No se ha podido iniciar el sprint.",
      "confirm_delete_sprint": "¿Seguro que quieres borrar este Sprint? Las tareas que contenga volverán al Backlog.",
      "error_delete_sprint": "No se ha podido borrar el sprint.",
      "confirm_complete_sprint": "¿Seguro que quieres completar este Sprint? Las tareas no borradas se quedarán donde están.",
      "success_complete_sprint": "¡Sprint completado con éxito! 🎉",
      "error_move_task": "No puedes mover esta tarea. Revisa las dependencias.",
      "invite_button": "Invitar",
      "new_task_button": "+ Nueva Tarea",
      
      // Project Board - Pestañas
      "tab_backlog": "Backlog & Planificación",
      "tab_board": "Tablero Activo",
      "tab_stats": "Estadísticas",
      
      // Project Board - Backlog
      "planned_sprints": "Sprints Planificados",
      "new_sprint_button": "+ Nuevo Sprint",
      "start_sprint_button": "Iniciar Sprint",
      "delete_sprint_tooltip": "Borrar Sprint",
      "drag_tasks_here": "Arrastra tareas aquí para planificarlas",
      "unassigned_tasks": "Tareas sin asignar (Backlog)",
      "empty_backlog": "No hay tareas en el Backlog.",
      
      // Project Board - Tablero
      "active_sprint": "Sprint Activo:",
      "complete_sprint_button": "✅ Completar Sprint",
      "no_active_sprint": "No hay ningún Sprint activo actualmente. Puedes iniciar uno desde la pestaña Backlog.",
      
      // Project Board - Filtros
      "filters_label": "Filtros:",
      "filter_type": "Tipo",
      "filter_all": "Todos",
      "filter_assignee": "Asignado a",
      "filter_everyone": "Todos",
      "clear_filters": "Limpiar",
      
      // Project Board - Columnas (Kanban)
      "column_backlog": "Backlog 💡",
      "column_ready": "Ready 🔥",
      "column_in_progress": "In Progress 🚀",
      "column_in_review": "In Review 👀",
      "column_done": "Done ✅",
      
      // Project Board - Etiquetas
      "type_task": "Tarea",
      "type_feature": "Feature",
      "type_bug": "Bug"
    }
  },
  en: {
    translation: {
      // Navbar & General
      "dashboard": "Dashboard",
      "projects": "Projects",
      "logged_in_as": "Logged in as:",
      "logout": "Log Out",

      // Dashboard Page
      "error_delete_project": "Could not delete the project.",
      "pending_invitations": "Pending Invitations",
      "invites_you_to": "invites you to",
      "accept": "Accept",
      "decline": "Decline",
      "my_projects": "My Projects",
      "new_project_button": "+ New Project",

      // Project Board - Actions and Modals
      "error_start_sprint": "Could not start the sprint.",
      "confirm_delete_sprint": "Are you sure you want to delete this Sprint? Its tasks will return to the Backlog.",
      "error_delete_sprint": "Could not delete the sprint.",
      "confirm_complete_sprint": "Are you sure you want to complete this Sprint? Uncompleted tasks will remain where they are.",
      "success_complete_sprint": "Sprint completed successfully! 🎉",
      "error_move_task": "Cannot move this task. Check its dependencies.",
      "invite_button": "Invite",
      "new_task_button": "+ New Task",
      
      // Project Board - Tabs
      "tab_backlog": "Backlog & Planning",
      "tab_board": "Active Board",
      "tab_stats": "Statistics",
      
      // Project Board - Backlog
      "planned_sprints": "Planned Sprints",
      "new_sprint_button": "+ New Sprint",
      "start_sprint_button": "Start Sprint",
      "delete_sprint_tooltip": "Delete Sprint",
      "drag_tasks_here": "Drag tasks here to plan them",
      "unassigned_tasks": "Unassigned Tasks (Backlog)",
      "empty_backlog": "No tasks in the Backlog.",
      
      // Project Board - Board
      "active_sprint": "Active Sprint:",
      "complete_sprint_button": "✅ Complete Sprint",
      "no_active_sprint": "There is no active Sprint right now. You can start one from the Backlog tab.",
      
      // Project Board - Filters
      "filters_label": "Filters:",
      "filter_type": "Type",
      "filter_all": "All",
      "filter_assignee": "Assignee",
      "filter_everyone": "Everyone",
      "clear_filters": "Clear",
      
      // Project Board - Columns (Kanban)
      "column_backlog": "Backlog 💡",
      "column_ready": "Ready 🔥",
      "column_in_progress": "In Progress 🚀",
      "column_in_review": "In Review 👀",
      "column_done": "Done ✅",
      
      // Project Board - Tags
      "type_task": "Task",
      "type_feature": "Feature",
      "type_bug": "Bug"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ca", // Idioma per defecte
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;