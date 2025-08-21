#######################
Configuration reference
#######################

Squareone is configured at runtime through a YAML configuration file.
The path for this configuration file is set by the ``SQUAREONE_CONFIG_PATH`` environment variable in production, and defaults to ``squareone.config.yaml`` in development.
This page documents the schema of that configuration file.

.. jsonschema:: squareone.config.schema.json
   :lift_description: True
