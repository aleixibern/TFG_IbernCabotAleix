package cat.tecnocampus.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "sprints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @OneToMany(mappedBy = "sprint")
    private List<Task> tasks;

    @Enumerated(EnumType.STRING)
    private SprintStatus status;

    // NOU: CAMPS PER GUARDAR CONSTÀNCIA DEL RESUM D'SPRINT
    @Column(name = "completed_tasks_count")
    private Integer completedTasksCount;

    @Column(name = "pending_tasks_count")
    private Integer pendingTasksCount;

    @Column(name = "mvp_user_name")
    private String mvpUserName;
}