package cat.tecnocampus.backend.repository;

import cat.tecnocampus.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Aquest és el mètode que utilitzem per tot ara
    Optional<User> findByEmail(String email);

    // Pots mantenir el de username si vols, però el principal serà l'email
    Optional<User> findByUsername(String username);
}