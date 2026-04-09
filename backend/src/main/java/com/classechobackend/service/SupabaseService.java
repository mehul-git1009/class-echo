package com.classechobackend.service;

import com.classechobackend.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class SupabaseService {

    private final WebClient webClient;

    @Autowired
    public SupabaseService(WebClient supabaseWebClient) {
        this.webClient = supabaseWebClient;
    }

    /**
     * Execute a SELECT query on a Supabase table
     * @param table The table name
     * @param select Columns to select (e.g., "*" or "id,name,email")
     * @return List of records
     */
    public Mono<JsonNode> select(String table, String select) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/rest/v1/" + table)
                        .queryParam("select", select)
                        .build())
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }

    /**
     * Insert a record into a Supabase table
     * @param table The table name
     * @param data The data to insert
     * @return The inserted record
     */
    public Mono<JsonNode> insert(String table, Map<String, Object> data) {
        return webClient.post()
                .uri("/rest/v1/" + table)
                .header("Prefer", "return=representation")
                .bodyValue(data)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }

    /**
     * Update records in a Supabase table
     * @param table The table name
     * @param filter Filter condition (e.g., "id=eq.1")
     * @param data The data to update
     * @return The updated records
     */
    public Mono<JsonNode> update(String table, String filter, Map<String, Object> data) {
        return webClient.patch()
                .uri("/rest/v1/" + table + "?" + filter)
                .header("Prefer", "return=representation")
                .bodyValue(data)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }

    /**
     * Delete records from a Supabase table
     * @param table The table name
     * @param filter Filter condition (e.g., "id=eq.1")
     * @return The deleted records
     */
    public Mono<JsonNode> delete(String table, String filter) {
        return webClient.delete()
                .uri("/rest/v1/" + table + "?" + filter)
                .header("Prefer", "return=representation")
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }

    /**
     * Execute a raw query with filters
     * @param table The table name
     * @param select Columns to select
     * @param filters Query parameters (e.g., Map.of("id", "eq.1", "name", "like.*John*"))
     * @return List of records
     */
    public Mono<JsonNode> query(String table, String select, Map<String, String> filters) {
        return webClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/rest/v1/" + table)
                            .queryParam("select", select);
                    filters.forEach(builder::queryParam);
                    return builder.build();
                })
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new BadRequestException("Supabase error: " + errorBody)))
                )
                .bodyToMono(JsonNode.class);
    }
}
