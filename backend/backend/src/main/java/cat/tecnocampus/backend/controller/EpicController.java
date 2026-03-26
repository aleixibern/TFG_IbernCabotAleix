package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.EpicRequest;
import cat.tecnocampus.backend.dto.EpicResponse;
import cat.tecnocampus.backend.service.EpicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/epics")
@RequiredArgsConstructor
public class EpicController {

    private final EpicService epicService;

    @PostMapping
    public ResponseEntity<EpicResponse> createEpic(@PathVariable Long projectId, @RequestBody EpicRequest request) {
        return ResponseEntity.ok(epicService.createEpic(projectId, request));
    }

    @GetMapping
    public ResponseEntity<List<EpicResponse>> getEpics(@PathVariable Long projectId) {
        return ResponseEntity.ok(epicService.getEpicsByProject(projectId));
    }
}