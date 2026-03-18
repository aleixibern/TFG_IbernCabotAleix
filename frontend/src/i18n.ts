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
      "type_bug": "Bug",

      // Estadístiques
      "unassigned": "Sense assignar",
      "no_data_stats": "No hi ha prou dades per generar estadístiques. Crea algunes tasques primer!",
      "global_status": "Estat Global del Projecte",
      "status_distribution": "Distribució de les {{count}} tasques per columna",
      "workload_per_member": "Càrrega de Treball per Membre",
      "tasks_assigned_to_user": "Tasques assignades a cada usuari",

      // Create Task Modal
      "new_task_modal_title": "Nova Tasca",
      "task_added_to_active_sprint": "Aquesta tasca s'afegirà a l'Sprint actiu",
      "task_title": "Títol",
      "task_description": "Descripció",
      "task_priority": "Prioritat",
      "priority_low": "Baixa",
      "priority_medium": "Mitjana",
      "priority_high": "Alta",
      "priority_urgent": "Urgent",
      "task_due_date": "Data Límit",
      "task_assignee": "Assignar a (Email)",
      "cancel": "Cancel·lar",
      "create_task_btn": "Crear Tasca",
      "error_create_task": "Error en crear la tasca. Revisa les dades.",

      // Edit Task Modal
      "edit_task_title": "Editar Tasca",
      "confirm_delete_task": "Segur que vols esborrar aquesta tasca? (S'esborraran també les subtasques i comentaris)",
      "confirm_delete_subtask": "Esborrar aquesta subtasca?",
      "assignee_placeholder": "Deixa-ho buit per desassignar",
      "depends_on": "Depèn de...",
      "blocking_tasks": "Tasques bloquejants",
      "blocking_tasks_placeholder": "Aquesta tasca no es pot fer fins que...",
      "task_blocked_by": "Aquesta tasca està bloquejada per {{count}} tasca/ques més.",
      "subtasks": "Subtasques",
      "new_subtask_placeholder": "Nova subtasca...",
      "add": "Afegir",
      "attached_links": "Enllaços Adjunts",
      "add_link_placeholder": "Afegir link (GitHub, Figma, etc...)",
      "comments": "Comentaris",
      "no_comments": "Cap comentari encara. Trenca el gel!",
      "write_comment_placeholder": "Escriu un comentari...",
      "send": "Enviar",
      "delete_task_btn": "Esborrar Tasca",
      "save_changes_btn": "Guardar Canvis",

      "sprint_performance_title": "Rendiment dels Sprints",
      "sprint_performance_desc": "Estat de les tasques segons la seva iteració",
      "pending_tasks": "Pendents",
      "in_progress_tasks": "En Curs",
      "completed_tasks": "Acabades",
      "workflow_pipeline_title": "Flux de Treball (Pipeline)",
      "workflow_pipeline_desc": "Detecta colls d'ampolla en les columnes del tauler",
      "no_sprints_message": "ℹ️ Crea algun Sprint a la pestanya de Backlog per veure'n el rendiment aquí.",
      "recent_activity_title": "Activitat recent",
      "recent_activity_desc": "Informa't del que passa en aquest projecte.",
      "no_recent_activity": "No hi ha activitat recent. Comença a crear i moure tasques!",
      "to_status": "a",
      "time_ago_seconds": "fa uns segons",
      "time_ago_minutes": "fa {{count}} minuts",
      "time_ago_hours": "fa {{count}} hores",
      "time_ago_yesterday": "ahir",
      "time_ago_days": "fa {{count}} dies",
      "action_created_task": "ha creat la tasca",
      "action_updated_status": "ha actualitzat el camp 'Estat' en",
      "action_deleted_task": "ha eliminat la tasca",
      "action_edited_task": "ha editat detalls de",
      "unknown_user": "Usuari Desconegut",

      "confirm_delete_project": "Estàs segur que vols esborrar el projecte",
      "delete_project_tooltip": "Esborrar Projecte",
      "view_details": "Veure Detalls"
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
      "type_bug": "Bug",

      // Estadísticas
      "unassigned": "Sin asignar",
      "no_data_stats": "¡No hay suficientes datos para generar estadísticas. Crea algunas tareas primero!",
      "global_status": "Estado Global del Proyecto",
      "status_distribution": "Distribución de las {{count}} tareas por columna",
      "workload_per_member": "Carga de Trabajo por Miembro",
      "tasks_assigned_to_user": "Tareas asignadas a cada usuario",

      // Create Task Modal
      "new_task_modal_title": "Nueva Tarea",
      "task_added_to_active_sprint": "Esta tarea se añadirá al Sprint activo",
      "task_title": "Título",
      "task_description": "Descripción",
      "task_priority": "Prioridad",
      "priority_low": "Baja",
      "priority_medium": "Media",
      "priority_high": "Alta",
      "priority_urgent": "Urgente",
      "task_due_date": "Fecha Límite",
      "task_assignee": "Asignar a (Email)",
      "cancel": "Cancelar",
      "create_task_btn": "Crear Tarea",
      "error_create_task": "Error al crear la tarea. Revisa los datos.",

      // Edit Task Modal
      "edit_task_title": "Editar Tarea",
      "confirm_delete_task": "¿Seguro que quieres borrar esta tarea? (Se borrarán también las subtareas y comentarios)",
      "confirm_delete_subtask": "¿Borrar esta subtarea?",
      "assignee_placeholder": "Déjalo vacío para desasignar",
      "depends_on": "Depende de...",
      "blocking_tasks": "Tareas bloqueantes",
      "blocking_tasks_placeholder": "Esta tarea no se puede hacer hasta que...",
      "task_blocked_by": "Esta tarea está bloqueada por {{count}} tarea/s más.",
      "subtasks": "Subtareas",
      "new_subtask_placeholder": "Nueva subtarea...",
      "add": "Añadir",
      "attached_links": "Enlaces Adjuntos",
      "add_link_placeholder": "Añadir link (GitHub, Figma, etc...)",
      "comments": "Comentarios",
      "no_comments": "Ningún comentario todavía. ¡Rompe el hielo!",
      "write_comment_placeholder": "Escribe un comentario...",
      "send": "Enviar",
      "delete_task_btn": "Borrar Tarea",
      "save_changes_btn": "Guardar Cambios",
      "sprint_performance_title": "Rendimiento de los Sprints",
      "sprint_performance_desc": "Estado de las tareas según su iteración",
      "pending_tasks": "Pendientes",
      "in_progress_tasks": "En Curso",
      "completed_tasks": "Completadas",
      "workflow_pipeline_title": "Flujo de Trabajo (Pipeline)",
      "workflow_pipeline_desc": "Detecta cuellos de botella en las columnas del tablero",
      "no_sprints_message": "ℹ️ Crea algún Sprint en la pestaña de Backlog para ver su rendimiento aquí.",
      "recent_activity_title": "Actividad reciente",
      "recent_activity_desc": "Entérate de lo que pasa en este proyecto.",
      "no_recent_activity": "No hay actividad reciente. ¡Empieza a crear y mover tareas!",
      "to_status": "a",
      "time_ago_seconds": "hace unos segundos",
      "time_ago_minutes": "hace {{count}} minutos",
      "time_ago_hours": "hace {{count}} horas",
      "time_ago_yesterday": "ayer",
      "time_ago_days": "hace {{count}} días",
      "action_created_task": "ha creado la tarea",
      "action_updated_status": "ha actualizado el campo 'Estado' en",
      "action_deleted_task": "ha eliminado la tarea",
      "action_edited_task": "ha editado detalles de",
      "unknown_user": "Usuario Desconocido",

      "confirm_delete_project": "¿Estás seguro que quieres borrar el proyecto",
      "delete_project_tooltip": "Borrar Proyecto",
      "view_details": "Ver Detalles"
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
      "type_bug": "Bug",

      // Statistics
      "unassigned": "Unassigned",
      "no_data_stats": "Not enough data to generate statistics. Create some tasks first!",
      "global_status": "Overall Project Status",
      "status_distribution": "Distribution of {{count}} tasks per column",
      "workload_per_member": "Workload per Member",
      "tasks_assigned_to_user": "Tasks assigned to each user",

      // Create Task Modal
      "new_task_modal_title": "New Task",
      "task_added_to_active_sprint": "This task will be added to the active Sprint",
      "task_title": "Title",
      "task_description": "Description",
      "task_priority": "Priority",
      "priority_low": "Low",
      "priority_medium": "Medium",
      "priority_high": "High",
      "priority_urgent": "Urgent",
      "task_due_date": "Due Date",
      "task_assignee": "Assignee (Email)",
      "cancel": "Cancel",
      "create_task_btn": "Create Task",
      "error_create_task": "Error creating task. Check the data.",

      // Edit Task Modal
      "edit_task_title": "Edit Task",
      "confirm_delete_task": "Are you sure you want to delete this task? (Subtasks and comments will also be deleted)",
      "confirm_delete_subtask": "Delete this subtask?",
      "assignee_placeholder": "Leave empty to unassign",
      "depends_on": "Depends on...",
      "blocking_tasks": "Blocking tasks",
      "blocking_tasks_placeholder": "This task cannot be done until...",
      "task_blocked_by": "This task is blocked by {{count}} other task/s.",
      "subtasks": "Subtasks",
      "new_subtask_placeholder": "New subtask...",
      "add": "Add",
      "attached_links": "Attached Links",
      "add_link_placeholder": "Add link (GitHub, Figma, etc...)",
      "comments": "Comments",
      "no_comments": "No comments yet. Break the ice!",
      "write_comment_placeholder": "Write a comment...",
      "send": "Send",
      "delete_task_btn": "Delete Task",
      "save_changes_btn": "Save Changes",
      "sprint_performance_title": "Sprint Performance",
      "sprint_performance_desc": "Task status according to their iteration",
      "pending_tasks": "Pending",
      "in_progress_tasks": "In Progress",
      "completed_tasks": "Completed",
      "workflow_pipeline_title": "Workflow Pipeline",
      "workflow_pipeline_desc": "Detect bottlenecks in the board columns",
      "no_sprints_message": "ℹ️ Create a Sprint in the Backlog tab to see its performance here.",
      "recent_activity_title": "Recent Activity",
      "recent_activity_desc": "Stay updated on what's happening in this project.",
      "no_recent_activity": "No recent activity. Start creating and moving tasks!",
      "to_status": "to",
      "time_ago_seconds": "a few seconds ago",
      "time_ago_minutes": "{{count}} minutes ago",
      "time_ago_hours": "{{count}} hours ago",
      "time_ago_yesterday": "yesterday",
      "time_ago_days": "{{count}} days ago",
      "action_created_task": "created task",
      "action_updated_status": "updated 'Status' in",
      "action_deleted_task": "deleted task",
      "action_edited_task": "edited details of",
      "unknown_user": "Unknown User",

      "confirm_delete_project": "Are you sure you want to delete the project",
      "delete_project_tooltip": "Delete Project",
      "view_details": "View Details"
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