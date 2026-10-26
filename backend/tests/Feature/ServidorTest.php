<?php

namespace Tests\Feature;

use Tests\TestCase;

class ServidorTest extends TestCase
{
    public function test_el_servidor_responde(): void
    {
        $this->getJson('/')->assertOk()->assertJsonPath('estado', 'ok');
    }
}
