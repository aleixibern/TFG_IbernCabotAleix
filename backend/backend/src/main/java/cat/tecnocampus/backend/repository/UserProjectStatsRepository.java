package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.UserProjectStats;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserProjectStatsRepository extends JpaRepository<UserProjectStats, Long> {
    Optional<UserProjectStats> findByUserEmailAndProjectId(String email, Long projectId);
    List<UserProjectStats> findByProjectId(Long projectId);
}