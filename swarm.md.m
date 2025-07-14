great, lets make some changes:

- remove the instance_type, vanity_address, env from the request body
- name is the name of the swarm
- vanity_address is the {name}.sphinx.chat always (no need to pass it in the request body)
add some details to the constants file for this:
- instance_type always = m5.xlarge for the 3rd party request
- env vars are always:
```
{
    "JARVIS_FEATURE_FLAG_WFA_SCHEMAS": "true",
    "JARVIS_FEATURE_FLAG_CODEGRAPH_SCHEMAS": "true"
}
```

Update to end of the endpoint logic:
- response will always return the swarm_id
- update the db with the swarm_id
- keep the db with the status = PENDING
- update the db with the updatedAt
- update response stating that the swarm is being created and is in progress returning the swarm_id

### Sample Response Data
```json
{
    "success": true,
    "message": "{name}-Swarm was created successfully",
    "data": {
        "swarm_id": "swarm456244.sphinx.chat"
    }
}
```