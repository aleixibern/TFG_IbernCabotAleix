package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.Epic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EpicRepository extends JpaRepository<Epic, Long> {
    List<Epic> findByProjectId(Long projectId);
}