# Alerting

## Overview

Alerting is about **getting notified when things go wrong** — before your users tell you. Good alerting is actionable, not noisy. Bad alerting causes "alert fatigue" where the team ignores alerts.

---

## Alerting Pyramid

```
            🔴 CRITICAL
           (Page someone)
         Error rate > 5%
        App completely down
       /                    \
      🟠 WARNING              
    (Slack channel)           
   Error rate > 1%            
  Performance degraded        
  /                      \    
 🟡 INFO                      
(Dashboard/log)               
Deployment started            
Unusual traffic pattern       
────────────────────────       
🟢 NOISE (Don't alert)        
Individual 404s                
Expected errors               
```

---

## What to Alert On

| Metric | Threshold | Severity | Channel |
|--------|-----------|:--------:|---------|
| Error rate | > 5% in 5 min | 🔴 Critical | Page on-call |
| Error rate | > 1% in 5 min | 🟠 Warning | Slack |
| LCP | p75 > 4s for 10 min | 🟠 Warning | Slack |
| CLS | p75 > 0.25 for 10 min | 🟡 Info | Dashboard |
| API latency | p95 > 3s for 5 min | 🟠 Warning | Slack |
| Bundle size | > 10% increase | 🟡 Info | PR comment |
| Uptime | Down for 1 min | 🔴 Critical | Page on-call |

---

## ✅ DO's

1. **Alert on symptoms, not causes** (high error rate, not "server CPU")
2. **Set meaningful thresholds** (based on baseline, not guesses)
3. **Use percentiles** (p75, p95, p99) not averages
4. **Include runbook links** in alert messages
5. **Have escalation paths** (Slack → PagerDuty → phone)
6. **Review and tune alerts** regularly (quarterly)
7. **Correlate with deployments** (did this start after a deploy?)

## ❌ DON'Ts

1. **Don't alert on every error** → alert fatigue
2. **Don't use averages** → they hide outliers
3. **Don't set static thresholds** without baselines
4. **Don't page for non-critical** → team ignores pages
5. **Don't have alerts with no owner** → nobody responds
6. **Don't forget to test alerts** → silent failures

---

## Common Mistakes (Interview)

| Mistake | Impact | Fix |
|---------|--------|-----|
| Alert fatigue | Team ignores ALL alerts | Reduce noise, prioritize |
| No runbook | Engineers waste time figuring out what to do | Link runbook in alert |
| Alerting on averages | Misses that 5% of users have 10s load time | Use p75/p95 |
| No deduplication | 100 alerts for same issue | Group by error fingerprint |
| Alerting in dev only | No monitoring in prod | Environment-aware configs |
