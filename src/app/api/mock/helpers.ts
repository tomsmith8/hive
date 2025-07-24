import {
  ChatRole,
  ChatStatus,
  ArtifactType,
  createChatMessage,
  createArtifact,
  Artifact,
} from "@/lib/chat";

// Generate unique IDs to prevent collisions
function generateUniqueId() {
  return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function makeRes(message: string, artifacts: Artifact[] = []) {
  return createChatMessage({
    id: generateUniqueId(),
    message: message,
    role: ChatRole.ASSISTANT,
    status: ChatStatus.SENT,
    artifacts: artifacts,
  });
}

export const PYTHON_CODE = `class ConnectionLeakMonitor
  def initialize(pool_size: 5, threshold: 0.8)
    @pool_size = pool_size
    @threshold = threshold
    @active_connections = 0
    @leaked_connections = []
    @logger = Rails.logger
  end

  def monitor_connection_pool
    current_usage = @active_connections.to_f / @pool_size

    if current_usage > @threshold
      @logger.warn "Connection pool usage at #{(current_usage * 100).round(2)}%"
      detect_leaks
    end

    log_metrics
  end

  def track_connection(connection)
    @active_connections += 1
    @logger.debug "Active connections: #{@active_connections}/#{@pool_size}"
  end

  def release_connection(connection)
    @active_connections -= 1 if @active_connections > 0
    @logger.debug "Active connections: #{@active_connections}/#{@pool_size}"
  end

  private

  def detect_leaks
    @leaked_connections = find_leaked_connections
    @leaked_connections.each do |conn|
      @logger.error "Closing leaked connection: #{conn.object_id}"
      conn.close
    end
  end

  def find_leaked_connections
    []
  end

  def log_metrics
    usage_percent = (@active_connections.to_f / @pool_size * 100).round(2)
    @logger.info "Pool usage: #{usage_percent}% (#{@active_connections}/#{@pool_size})"
  end
end`;

export const JSON_CODE = `{
  "database": {
    "adapter": "postgresql",
    "host": "aurora-cluster.cluster-xyz.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "senza_lnd_production",
    "pool": {
      "size": 10,
      "timeout": 5000,
      "checkout_timeout": 5000,
      "reaping_frequency": 60
    },
    "leak_detection": {
      "enabled": true,
      "threshold": 0.8,
      "check_interval": 30000,
      "max_connection_age": 300000
    }
  },
  "monitoring": {
    "metrics_enabled": true,
    "alert_threshold": 0.9,
    "log_level": "info",
    "cloudwatch_enabled": true
  }
}`;

export { createArtifact, ArtifactType };
