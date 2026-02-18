package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.ProjectInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, Long> {
    List<ProjectInvitation> findByReceiverEmail(String email);
    Optional<ProjectInvitation> findByReceiverEmailAndProjectId(String email, Long projectId);
}