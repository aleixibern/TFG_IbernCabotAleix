package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner.email = :email OR m.email = :email")
    List<Project> findAllProjectsForUser(@Param("email") String email);
}