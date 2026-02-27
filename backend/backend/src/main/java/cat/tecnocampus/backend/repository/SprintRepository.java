package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectId(Long projectId);

    @Query("SELECT COUNT(s) > 0 FROM Sprint s WHERE s.project.id = :projectId AND " +
            "((s.startDate BETWEEN :newStart AND :newEnd) OR " +
            " (s.endDate BETWEEN :newStart AND :newEnd) OR " +
            " (:newStart BETWEEN s.startDate AND s.endDate))")
    boolean existsOverlappingSprint(@Param("projectId") Long projectId,
                                    @Param("newStart") LocalDate newStart,
                                    @Param("newEnd") LocalDate newEnd);
}