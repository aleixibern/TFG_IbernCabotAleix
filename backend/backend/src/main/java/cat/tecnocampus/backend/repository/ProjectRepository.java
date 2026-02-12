package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Aquesta línia és vital:
    List<Project> findByOwnerEmail(String email);
}