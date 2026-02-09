package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Spring Data JPA crea la query SQL automàticament amb aquest nom:
    // "SELECT * FROM projects WHERE user_id = ?"
    List<Project> findAllByOwnerId(Long userId);
}