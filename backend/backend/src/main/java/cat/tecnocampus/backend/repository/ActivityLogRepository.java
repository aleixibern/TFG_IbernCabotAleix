package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByProjectIdOrderByTimestampDesc(Long projectId);

    List<ActivityLog> findByTaskIdOrderByTimestampDesc(Long taskId);
}