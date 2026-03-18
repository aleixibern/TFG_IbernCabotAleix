package cat.tecnocampus.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Qui ha fet l'acció
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // A quin projecte pertany (per poder filtrar per projecte al frontend)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Relacionat amb quina tasca (opcional, ja que l'acció pot ser sobre l'sprint o el projecte en si)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    // Descripció de l'acció (ex: "ha actualitzat el camp 'Estat' en")
    @Column(nullable = false, length = 500)
    private String actionDescription;

    // Valor antic (opcional, ex: "BACKLOG")
    @Column(name = "old_value")
    private String oldValue;

    // Valor nou (opcional, ex: "IN_PROGRESS")
    @Column(name = "new_value")
    private String newValue;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}