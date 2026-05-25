#pragma once

#include "Cube.h"
#include "ValidationResult.h"

class Validator {
public:
    ValidationResult validate(const Cube& cube) const;
};
