package com.VladosSUPER.TaskService.models.exceptions;

public class OutboxEventNotFoundException extends RuntimeException {
  public OutboxEventNotFoundException(String message) {
    super(message);
  }
}
