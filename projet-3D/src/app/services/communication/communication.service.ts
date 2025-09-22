import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Interface pour les événements de communication
 */
export interface CommunicationEvent {
  id: string;
  type: string;
  source: string;
  target?: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Interface pour les messages entre services
 */
export interface ServiceMessage {
  from: string;
  to: string;
  action: string;
  payload: any;
  timestamp: Date;
}

/**
 * Interface pour les statistiques de communication
 */
export interface CommunicationStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySource: Record<string, number>;
  eventsByPriority: Record<string, number>;
  averageResponseTime: number;
  lastEvent: Date | null;
}

/**
 * Service de communication entre les services
 */
@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  
  private eventSubject = new Subject<CommunicationEvent>();
  private messageSubject = new Subject<ServiceMessage>();
  private statsSubject = new BehaviorSubject<CommunicationStats>({
    totalEvents: 0,
    eventsByType: {},
    eventsBySource: {},
    eventsByPriority: {},
    averageResponseTime: 0,
    lastEvent: null
  });

  private events: CommunicationEvent[] = [];
  private messages: ServiceMessage[] = [];
  private responseTimes: number[] = [];

  public events$ = this.eventSubject.asObservable();
  public messages$ = this.messageSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor() {
    console.log('CommunicationService initialisé');
  }

  /**
   * Émettre un événement
   */
  emitEvent(event: Omit<CommunicationEvent, 'id' | 'timestamp'>): void {
    const fullEvent: CommunicationEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.eventSubject.next(fullEvent);
    this.updateStats();
    
    console.log(`[CommunicationService] Événement émis:`, fullEvent);
  }

  /**
   * Écouter les événements par type
   */
  listenToEventType(eventType: string): Observable<CommunicationEvent> {
    return this.events$.pipe(
      filter(event => event.type === eventType)
    );
  }

  /**
   * Écouter les événements par source
   */
  listenToSource(source: string): Observable<CommunicationEvent> {
    return this.events$.pipe(
      filter(event => event.source === source)
    );
  }

  /**
   * Écouter les événements par priorité
   */
  listenToPriority(priority: CommunicationEvent['priority']): Observable<CommunicationEvent> {
    return this.events$.pipe(
      filter(event => event.priority === priority)
    );
  }

  /**
   * Envoyer un message entre services
   */
  sendMessage(message: Omit<ServiceMessage, 'timestamp'>): void {
    const fullMessage: ServiceMessage = {
      ...message,
      timestamp: new Date()
    };

    this.messages.push(fullMessage);
    this.messageSubject.next(fullMessage);
    
    console.log(`[CommunicationService] Message envoyé:`, fullMessage);
  }

  /**
   * Écouter les messages destinés à un service
   */
  listenToMessages(serviceName: string): Observable<ServiceMessage> {
    return this.messages$.pipe(
      filter(message => message.to === serviceName)
    );
  }

  /**
   * Écouter les messages d'un service
   */
  listenFromService(serviceName: string): Observable<ServiceMessage> {
    return this.messages$.pipe(
      filter(message => message.from === serviceName)
    );
  }

  /**
   * Obtenir tous les événements
   */
  getEvents(): CommunicationEvent[] {
    return [...this.events];
  }

  /**
   * Obtenir tous les messages
   */
  getMessages(): ServiceMessage[] {
    return [...this.messages];
  }

  /**
   * Obtenir les événements récents (dernières 24h)
   */
  getRecentEvents(hours: number = 24): CommunicationEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.events.filter(event => event.timestamp > cutoff);
  }

  /**
   * Obtenir les événements par type
   */
  getEventsByType(type: string): CommunicationEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Obtenir les événements par source
   */
  getEventsBySource(source: string): CommunicationEvent[] {
    return this.events.filter(event => event.source === source);
  }

  /**
   * Obtenir les événements par priorité
   */
  getEventsByPriority(priority: CommunicationEvent['priority']): CommunicationEvent[] {
    return this.events.filter(event => event.priority === priority);
  }

  /**
   * Mettre à jour les statistiques
   */
  private updateStats(): void {
    const stats: CommunicationStats = {
      totalEvents: this.events.length,
      eventsByType: this.getEventsByTypeStats(),
      eventsBySource: this.getEventsBySourceStats(),
      eventsByPriority: this.getEventsByPriorityStats(),
      averageResponseTime: this.calculateAverageResponseTime(),
      lastEvent: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null
    };

    this.statsSubject.next(stats);
  }

  /**
   * Obtenir les statistiques par type
   */
  private getEventsByTypeStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.events.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    return stats;
  }

  /**
   * Obtenir les statistiques par source
   */
  private getEventsBySourceStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.events.forEach(event => {
      stats[event.source] = (stats[event.source] || 0) + 1;
    });
    return stats;
  }

  /**
   * Obtenir les statistiques par priorité
   */
  private getEventsByPriorityStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.events.forEach(event => {
      stats[event.priority] = (stats[event.priority] || 0) + 1;
    });
    return stats;
  }

  /**
   * Calculer le temps de réponse moyen
   */
  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.responseTimes.length * 100) / 100;
  }

  /**
   * Enregistrer un temps de réponse
   */
  recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    this.updateStats();
  }

  /**
   * Obtenir les statistiques actuelles
   */
  getStats(): CommunicationStats {
    return this.statsSubject.value;
  }

  /**
   * Obtenir les statistiques en tant qu'Observable
   */
  getStatsObservable(): Observable<CommunicationStats> {
    return this.stats$;
  }

  /**
   * Effacer l'historique des événements
   */
  clearEvents(): void {
    this.events = [];
    this.eventSubject.next({
      id: 'clear',
      type: 'system',
      source: 'CommunicationService',
      data: { action: 'clear' },
      timestamp: new Date(),
      priority: 'medium'
    });
    this.updateStats();
  }

  /**
   * Effacer l'historique des messages
   */
  clearMessages(): void {
    this.messages = [];
    this.messageSubject.next({
      from: 'CommunicationService',
      to: 'all',
      action: 'clear',
      payload: { action: 'clear' },
      timestamp: new Date()
    });
  }

  /**
   * Exporter les données de communication
   */
  exportCommunicationData(): string {
    const data = {
      events: this.events,
      messages: this.messages,
      stats: this.getStats(),
      exportDate: new Date()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importer les données de communication
   */
  importCommunicationData(dataJson: string): boolean {
    try {
      const data = JSON.parse(dataJson);
      
      if (data.events) {
        this.events = data.events;
      }
      
      if (data.messages) {
        this.messages = data.messages;
      }
      
      this.updateStats();
      console.log('Données de communication importées avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation des données de communication:', error);
      return false;
    }
  }

  /**
   * Méthodes utilitaires pour les événements courants
   */

  /**
   * Émettre un événement de modification de mur
   */
  emitWallModified(wallId: string, changes: any): void {
    this.emitEvent({
      type: 'wall_modified',
      source: 'MurService',
      data: { wallId, changes },
      priority: 'medium'
    });
  }

  /**
   * Émettre un événement de modification d'ouverture
   */
  emitOpeningModified(openingId: string, changes: any): void {
    this.emitEvent({
      type: 'opening_modified',
      source: 'OuvertureService',
      data: { openingId, changes },
      priority: 'medium'
    });
  }

  /**
   * Émettre un événement de changement de matériau
   */
  emitMaterialChanged(materialId: string, newMaterial: any): void {
    this.emitEvent({
      type: 'material_changed',
      source: 'MateriauService',
      data: { materialId, newMaterial },
      priority: 'low'
    });
  }

  /**
   * Émettre un événement de mise à jour de la scène
   */
  emitSceneUpdated(sceneData: any): void {
    this.emitEvent({
      type: 'scene_updated',
      source: 'SceneService',
      data: sceneData,
      priority: 'high'
    });
  }

  /**
   * Émettre un événement de validation
   */
  emitValidationResult(validationData: any): void {
    this.emitEvent({
      type: 'validation_result',
      source: 'ValidationService',
      data: validationData,
      priority: 'high'
    });
  }

  /**
   * Émettre un événement d'erreur
   */
  emitError(error: any, source: string): void {
    this.emitEvent({
      type: 'error',
      source: source,
      data: { error: error.message || error, stack: error.stack },
      priority: 'critical'
    });
  }

  /**
   * Émettre un événement de succès
   */
  emitSuccess(message: string, source: string, data?: any): void {
    this.emitEvent({
      type: 'success',
      source: source,
      data: { message, ...data },
      priority: 'low'
    });
  }
}

